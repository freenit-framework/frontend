export interface OmemoBundle {
  deviceId: number
  identityKey: Uint8Array // 33 bytes serialized
  signedPreKeyId: number
  signedPreKeyPublic: Uint8Array // 33 bytes serialized
  signedPreKeySignature: Uint8Array // 64 bytes
  preKeys: OmemoPreKey[]
}

export interface OmemoPreKey {
  id: number
  publicKey: Uint8Array // 33 bytes serialized
}

export interface OmemoDeviceList {
  devices: number[]
}

export interface OmemoEncryptedPayload {
  sid: number // sender device id
  iv: Uint8Array // 12 bytes
  keys: OmemoKeyHeader[]
  payload: Uint8Array // ciphertext
}

export interface OmemoKeyHeader {
  rid: number // recipient device id
  preKey: boolean
  value: Uint8Array
}

export interface OmemoSessionRecord {
  jid: string
  deviceId: number
  data: number[]
  updatedAt: number
}

export interface OmemoStoreRecord {
  id: string
  data: number[]
  updatedAt: number
}
