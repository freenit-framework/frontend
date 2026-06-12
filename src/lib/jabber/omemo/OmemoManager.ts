import type { Agent, Stanzas } from 'stanza'
import {
  NS_OMEMO_AXOLOTL_BUNDLE,
  NS_OMEMO_AXOLOTL_BUNDLES,
  NS_OMEMO_AXOLOTL_DEVICELIST,
} from 'stanza/Namespaces'
import { Buffer } from 'buffer'
import { OmemoWasm } from './wasm'
import { OmemoIndexedDbStore } from './store'
import type { OmemoBundle, OmemoEncryptedPayload, OmemoDeviceList } from './types'

const IV_SIZE = 12

const PUBSUB_PUBLISH_OPTIONS = {
  type: 'submit' as const,
  fields: [
    {
      name: 'FORM_TYPE',
      type: 'hidden' as const,
      value: 'http://jabber.org/protocol/pubsub#publish-options',
    },
    { name: 'pubsub#max_items', value: '1' },
    { name: 'pubsub#access_model', value: 'open' },
  ],
}

function u8ToBase64(u: Uint8Array): string {
  let s = ''
  for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i])
  return btoa(s)
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((a, b) => a + b.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const p of parts) {
    out.set(p, off)
    off += p.length
  }
  return out
}

function getRandomBytes(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n))
}

export class OmemoManager {
  private wasm = new OmemoWasm()
  private db = new OmemoIndexedDbStore()
  private client: Agent | null = null
  private accountId = ''
  private deviceId = 0
  private ready = false

  async init(client: Agent, accountId: string) {
    if (this.ready) return
    this.client = client
    this.accountId = accountId
    await this.wasm.init()
    await this.db.init()

    const storeData = await this.db.loadStore(this.accountId)
    try {
      this.wasm.loadOrCreate(0, storeData ?? undefined)
    } catch {
      this.wasm.loadOrCreate(0, undefined)
    }

    this.deviceId = this.wasm.deviceId()

    this.wasm.refillPreKeys()
    await this.persistStore()

    await this.publishDeviceList()
    await this.publishBundle()
    await this.subscribeToDeviceLists()

    this.ready = true
  }

  async destroy() {
    this.ready = false
  }

  private async persistStore() {
    const data = this.wasm.serialize()
    await this.db.saveStore(this.accountId, data)
  }

  private async pruneDeviceList(devices: number[]): Promise<number[]> {
    if (!devices.includes(this.deviceId)) {
      devices = [...devices, this.deviceId]
    }

    const validDevices: number[] = []
    for (const rid of devices) {
      if (rid === this.deviceId) {
        validDevices.push(rid)
      } else {
        const bundle = await this.fetchBundle(this.accountId, rid)
        if (bundle) {
          validDevices.push(rid)
        } else {
          console.warn(`OMEMO pruning stale device ${rid} from device list`)
        }
      }
    }
    return validDevices
  }

  private async publishDeviceListRaw(devices: number[]) {
    if (!this.client) throw new Error('Not initialized')

    console.log('OMEMO publishing device list:', devices)
    await this.client.sendIQ({
      to: this.accountId,
      type: 'set',
      pubsub: {
        context: 'user',
        publish: {
          node: NS_OMEMO_AXOLOTL_DEVICELIST,
          item: {
            id: 'current',
            content: {
              itemType: NS_OMEMO_AXOLOTL_DEVICELIST,
              devices,
            },
          },
        },
        publishOptions: PUBSUB_PUBLISH_OPTIONS,
      },
    })
  }

  async publishDeviceList() {
    if (!this.client) throw new Error('Not initialized')

    let devices: number[] = []
    try {
      const item = await this.client.getItem(this.accountId, NS_OMEMO_AXOLOTL_DEVICELIST, 'current')
      const content = item?.content as { devices?: number[] } | undefined
      devices = content?.devices ?? []
      console.log('OMEMO fetched device list:', devices)
    } catch (e) {
      console.warn('OMEMO failed to fetch device list:', e)
    }

    const validDevices = await this.pruneDeviceList(devices)
    await this.publishDeviceListRaw(validDevices)
  }

  /**
   * Re-prune a device-list update received via PEP notification.
   * If the update reintroduces stale ids, republish the corrected list.
   */
  async handleDeviceListUpdate(jid: string, devices: number[]) {
    if (!this.client || jid !== this.accountId) return

    const validDevices = await this.pruneDeviceList(devices)

    const same =
      validDevices.length === devices.length &&
      validDevices.every((id, index) => id === devices[index])
    if (same) {
      console.log('OMEMO device-list update is valid:', validDevices)
      return
    }

    console.warn('OMEMO re-pruning stale device-list update:', devices, '->', validDevices)
    await this.publishDeviceListRaw(validDevices)
  }

  async publishBundle() {
    if (!this.client) throw new Error('Not initialized')
    const bundle = this.wasm.bundle()
    const content = {
      itemType: NS_OMEMO_AXOLOTL_BUNDLES,
      identityKey: Buffer.from(bundle.identityKey),
      signedPreKeyPublic: {
        id: bundle.signedPreKeyId,
        value: Buffer.from(bundle.signedPreKeyPublic),
      },
      signedPreKeySignature: Buffer.from(bundle.signedPreKeySignature),
      preKeys: bundle.preKeys.map((pk) => ({ id: pk.id, value: Buffer.from(pk.publicKey) })),
    }

    const publishBundleIQ = (withOptions: boolean) =>
      this.client!.sendIQ({
        to: this.accountId,
        type: 'set',
        pubsub: {
          context: 'user',
          publish: {
            node: NS_OMEMO_AXOLOTL_BUNDLE(String(this.deviceId)),
            item: {
              id: String(this.deviceId),
              content,
            },
          },
          ...(withOptions ? { publishOptions: PUBSUB_PUBLISH_OPTIONS } : {}),
        },
      })

    try {
      await publishBundleIQ(true)
    } catch (e) {
      console.warn(
        'OMEMO bundle publish with options failed (node may already exist with different config), retrying without options:',
        e,
      )
      await publishBundleIQ(false)
    }

    await this.saveBackendBundle(bundle)

    console.log('OMEMO published bundle for device', this.deviceId, {
      identityKey: u8ToBase64(bundle.identityKey),
      signedPreKeyId: bundle.signedPreKeyId,
      signedPreKeyPublic: u8ToBase64(bundle.signedPreKeyPublic),
      signedPreKeySignature: u8ToBase64(bundle.signedPreKeySignature),
      preKeys: bundle.preKeys.map((pk) => ({ id: pk.id, value: u8ToBase64(pk.publicKey) })),
    })
  }

  private async saveBackendBundle(bundle: OmemoBundle) {
    const body = {
      bundle: {
        identityKey: u8ToBase64(bundle.identityKey),
        signedPreKey: u8ToBase64(concat(bundle.signedPreKeyPublic, bundle.signedPreKeySignature)),
        preKeys: bundle.preKeys.map((pk) => u8ToBase64(pk.publicKey)),
        registrationId: this.deviceId,
        deviceId: this.deviceId,
      },
    }
    await fetch('/api/v1/profile/omemo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })
  }

  async subscribeToDeviceLists() {
    if (!this.client) throw new Error('Not initialized')
    await this.client.subscribeToNode(this.accountId, NS_OMEMO_AXOLOTL_DEVICELIST)
  }

  async fetchDeviceList(jid: string): Promise<OmemoDeviceList> {
    if (!this.client) throw new Error('Not initialized')
    try {
      const item = await this.client.getItem(jid, NS_OMEMO_AXOLOTL_DEVICELIST, 'current')
      const content = item?.content as { devices?: number[] } | undefined
      return { devices: content?.devices ?? [] }
    } catch {
      return { devices: [] }
    }
  }

  async fetchBundle(jid: string, deviceId: number): Promise<OmemoBundle | null> {
    if (!this.client) throw new Error('Not initialized')
    try {
      const item = await this.client.getItem(
        jid,
        NS_OMEMO_AXOLOTL_BUNDLE(String(deviceId)),
        String(deviceId),
      )
      const c = item?.content as
        | {
            identityKey: Buffer
            signedPreKeyPublic?: { id: number; value: Buffer }
            signedPreKeySignature?: Buffer
            preKeys?: { id: number; value: Buffer }[]
          }
        | undefined
      if (!c) return null

      const signedPreKeyPublic = c.signedPreKeyPublic?.value
      if (!signedPreKeyPublic || !c.signedPreKeySignature || !c.preKeys || c.preKeys.length === 0)
        return null

      return {
        deviceId,
        identityKey: new Uint8Array(c.identityKey),
        signedPreKeyId: c.signedPreKeyPublic!.id,
        signedPreKeyPublic: new Uint8Array(signedPreKeyPublic),
        signedPreKeySignature: new Uint8Array(c.signedPreKeySignature),
        preKeys: c.preKeys.map((pk) => ({
          id: pk.id,
          publicKey: new Uint8Array(pk.value),
        })),
      }
    } catch {
      return null
    }
  }

  async encrypt(toJid: string, plaintext: string): Promise<OmemoEncryptedPayload | null> {
    if (!this.ready) return null

    const deviceList = await this.fetchDeviceList(toJid)
    console.log('OMEMO encrypt for', toJid, 'devices:', deviceList.devices)
    if (deviceList.devices.length === 0) return null

    const iv = getRandomBytes(IV_SIZE)
    const aesKey = getRandomBytes(16)
    const plaintextBytes = new TextEncoder().encode(plaintext)
    const paddedLen = plaintextBytes.length + ((16 - (plaintextBytes.length % 16)) % 16)
    const padded = new Uint8Array(paddedLen)
    padded.set(plaintextBytes)
    const { ciphertext, tag } = this.wasm.encryptMessage(padded, iv, aesKey)
    const key = concat(aesKey, tag)

    const keys: { rid: number; preKey: boolean; value: Uint8Array }[] = []
    for (const rid of deviceList.devices) {
      const bundle = await this.fetchBundle(toJid, rid)
      try {
        const encrypted = await this.wasm.encryptKey(toJid, rid, bundle, key)
        keys.push({ rid, preKey: encrypted.preKey, value: encrypted.value })
      } catch (e) {
        console.warn(`OMEMO encrypt key failed for ${toJid}:${rid}:`, e)
      }
    }

    console.log('OMEMO encrypt keys:', {
      sid: this.deviceId,
      iv: u8ToBase64(iv),
      aesKey: u8ToBase64(aesKey),
      tag: u8ToBase64(tag),
      keys: keys.map((k) => ({ rid: k.rid, preKey: k.preKey, value: u8ToBase64(k.value) })),
    })

    if (keys.length === 0) return null
    await this.persistStore()

    return { sid: this.deviceId, iv, keys, payload: ciphertext }
  }

  async decrypt(fromJid: string, payload: OmemoEncryptedPayload): Promise<string | null> {
    if (!this.ready) return null

    const keyHeader = payload.keys.find((k) => k.rid === this.deviceId)
    if (!keyHeader) {
      console.warn(
        `OMEMO key not found for our device ${this.deviceId}; available rids:`,
        payload.keys.map((k) => k.rid),
      )
      return null
    }

    try {
      const decryptedKey = await this.wasm.decryptKey(
        fromJid,
        payload.sid,
        keyHeader.preKey,
        keyHeader.value,
      )
      console.log('OMEMO decrypt key:', {
        fromJid,
        sid: payload.sid,
        rid: this.deviceId,
        preKey: keyHeader.preKey,
        decryptedKey: u8ToBase64(decryptedKey),
      })
      const padded = this.wasm.decryptMessage(payload.payload, payload.iv, decryptedKey)
      const padLen = padded[padded.length - 1] || 0
      const plaintext = padded.slice(0, padded.length - padLen)
      await this.persistStore()
      return new TextDecoder().decode(plaintext)
    } catch (e) {
      console.warn('OMEMO decrypt failed:', e)
      return null
    }
  }

  buildStanzaPayload(payload: OmemoEncryptedPayload): Stanzas.Message['omemo'] {
    return {
      header: {
        sid: payload.sid,
        iv: Buffer.from(payload.iv),
        keys: payload.keys.map((k) => ({
          rid: k.rid,
          preKey: k.preKey,
          value: Buffer.from(k.value),
        })),
      },
      payload: Buffer.from(payload.payload),
    }
  }

  parseStanzaPayload(msg: Stanzas.ReceivedMessage): OmemoEncryptedPayload | null {
    if (!msg.omemo) return null
    const o = msg.omemo as {
      header: { sid: number; iv: Buffer; keys: { rid: number; preKey?: boolean; value: Buffer }[] }
      payload?: Buffer
    }
    if (!o.header || !o.payload) return null
    return {
      sid: o.header.sid,
      iv: new Uint8Array(o.header.iv),
      keys: o.header.keys.map((k) => ({
        rid: k.rid,
        preKey: k.preKey ?? false,
        value: new Uint8Array(k.value),
      })),
      payload: new Uint8Array(o.payload),
    }
  }

  getDeviceId(): number {
    return this.deviceId
  }
}
