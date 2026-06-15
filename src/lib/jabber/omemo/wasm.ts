import type { OmemoBundle } from './types'

import init, { OmemoCrypto } from './wasm/freenit_omemo.js'
import wasmUrl from './wasm/freenit_omemo_bg.wasm?url'

let initPromise: Promise<unknown> | null = null

async function ensureInit(): Promise<unknown> {
  if (initPromise) return initPromise
  console.log('Initializing OMEMO WASM from', wasmUrl)
  initPromise = init(wasmUrl).catch((e) => {
    console.error('Failed to initialize OMEMO WASM from', wasmUrl, e)
    throw e
  })
  return initPromise
}

export class OmemoWasm {
  private crypto: OmemoCrypto | null = null

  async init() {
    await ensureInit()
  }

  private ensure() {
    if (!this.crypto) throw new Error('OmemoWasm not initialized')
    return this.crypto
  }

  loadOrCreate(deviceId: number, data?: Uint8Array) {
    if (data && data.length > 0) {
      this.crypto = OmemoCrypto.load(deviceId, data)
    } else {
      this.crypto = new OmemoCrypto(deviceId)
    }
  }

  serialize(): Uint8Array {
    return this.ensure().serialize()
  }

  deviceId(): number {
    return this.ensure().device_id
  }

  refillPreKeys() {
    this.ensure().refill_prekeys()
  }

  rotateSignedPreKey() {
    this.ensure().rotate_signed_prekey()
  }

  bundle(): OmemoBundle {
    return this.ensure().bundle() as OmemoBundle
  }

  async encryptKey(
    jid: string,
    deviceId: number,
    bundle: OmemoBundle | null,
    key: Uint8Array,
  ): Promise<{ preKey: boolean; value: Uint8Array }> {
    const result = (await this.ensure().encrypt_key(jid, deviceId, bundle, key)) as {
      preKey: boolean
      value: Uint8Array
    }
    return result
  }

  async decryptKey(
    jid: string,
    deviceId: number,
    isPreKey: boolean,
    value: Uint8Array,
  ): Promise<Uint8Array> {
    return this.ensure().decrypt_key(jid, deviceId, isPreKey, value)
  }

  encryptPayload(plaintext: Uint8Array): {
    ciphertext: Uint8Array
    key: Uint8Array
    authTag: Uint8Array
    iv: Uint8Array
  } {
    return this.ensure().encrypt_payload(plaintext) as {
      ciphertext: Uint8Array
      key: Uint8Array
      authTag: Uint8Array
      iv: Uint8Array
    }
  }

  decryptPayload(ciphertext: Uint8Array, iv: Uint8Array, keyAndTag: Uint8Array): Uint8Array {
    return this.ensure().decrypt_payload(ciphertext, iv, keyAndTag)
  }
}
