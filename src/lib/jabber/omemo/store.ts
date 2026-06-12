import type { OmemoStoreRecord, OmemoSessionRecord } from './types'

const DB_NAME = 'freenit-omemo'
const DB_VERSION = 1
const STORE_STORE = 'store'
const SESSIONS_STORE = 'sessions'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_STORE)) {
        db.createObjectStore(STORE_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        const s = db.createObjectStore(SESSIONS_STORE, { keyPath: ['jid', 'deviceId'] })
        s.createIndex('jid', 'jid', { unique: false })
      }
    }
  })
}

export class OmemoIndexedDbStore {
  private db: IDBDatabase | null = null

  async init() {
    this.db = await openDb()
  }

  async loadStore(accountId: string): Promise<Uint8Array | null> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_STORE, 'readonly')
      const store = tx.objectStore(STORE_STORE)
      const req = store.get(accountId)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => {
        const record = req.result as OmemoStoreRecord | undefined
        resolve(record && record.data ? new Uint8Array(record.data) : null)
      }
    })
  }

  async saveStore(accountId: string, data: Uint8Array) {
    if (!this.db) await this.init()
    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction(STORE_STORE, 'readwrite')
      const store = tx.objectStore(STORE_STORE)
      const record: OmemoStoreRecord = {
        id: accountId,
        data: Array.from(data),
        updatedAt: Date.now(),
      }
      const req = store.put(record)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve()
    })
  }

  async loadSession(jid: string, deviceId: number): Promise<Uint8Array | null> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(SESSIONS_STORE, 'readonly')
      const store = tx.objectStore(SESSIONS_STORE)
      const req = store.get([jid, deviceId])
      req.onerror = () => reject(req.error)
      req.onsuccess = () => {
        const record = req.result as OmemoSessionRecord | undefined
        resolve(record && record.data ? new Uint8Array(record.data) : null)
      }
    })
  }

  async saveSession(jid: string, deviceId: number, data: Uint8Array) {
    if (!this.db) await this.init()
    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction(SESSIONS_STORE, 'readwrite')
      const store = tx.objectStore(SESSIONS_STORE)
      const record: OmemoSessionRecord = {
        jid,
        deviceId,
        data: Array.from(data),
        updatedAt: Date.now(),
      }
      const req = store.put(record)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve()
    })
  }

  async loadSessionsForJid(jid: string): Promise<OmemoSessionRecord[]> {
    if (!this.db) await this.init()
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(SESSIONS_STORE, 'readonly')
      const store = tx.objectStore(SESSIONS_STORE)
      const idx = store.index('jid')
      const req = idx.getAll(jid)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => {
        resolve(req.result as OmemoSessionRecord[])
      }
    })
  }

  async deleteSession(jid: string, deviceId: number) {
    if (!this.db) await this.init()
    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction(SESSIONS_STORE, 'readwrite')
      const store = tx.objectStore(SESSIONS_STORE)
      const req = store.delete([jid, deviceId])
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve()
    })
  }
}
