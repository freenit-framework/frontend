import * as XMPP from 'stanza'
import type { Agent, Stanzas } from 'stanza'
import type { ChatMessage, OmemoBundle, RosterItem, Room } from './types'
import { OmemoManager } from './omemo/OmemoManager'
import { error, notification } from '../notification'

function bareJid(jid: string): string {
  return jid.split('/')[0]
}

class JabberStore {
  client: Agent | null = $state(null)
  connected = $state(false)
  connecting = $state(false)
  error = $state('')
  roster = $state<RosterItem[]>([])
  rooms = $state<Room[]>([])
  messages = $state<Record<string, ChatMessage[]>>({})
  selectedJid = $state<string | null>(null)
  selectedIsRoom = $state(false)
  myJid = $state('')
  wsURL = $state('')
  attemptedURL = $state('')
  historyFetched = $state<Set<string>>(new Set())
  historyLoading = $state<Set<string>>(new Set())
  omemoManager = $state<OmemoManager | null>(null)
  omemoEnabled = $state<Record<string, boolean>>({})

  // Reconnect state
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectDelay = 2000
  private reconnectAttempts = 0
  private maxReconnectDelay = 30000
  private maxReconnectAttempts = 5

  // Outgoing self-OMEMO messages are stored by id so that the carbon copy can
  // be shown as plaintext without trying to decrypt our own Signal ciphertext.
  private pendingSelfOmemo = new Map<string, { body: string; time: number }>()
  private pendingSelfOmemoMaxAge = 5 * 60 * 1000

  async fetchConfig(): Promise<void> {
    try {
      const response = await fetch('/api/v1/jabber/config', {
        headers: { Accept: 'application/json' },
      })
      if (response.ok) {
        const data = await response.json()
        this.wsURL = data.ws_url || ''
      }
    } catch {
      // non-fatal, will fall back to derived URL
    }
  }

  async fetchToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/v1/auth/token', {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) return null
      const data = await response.json()
      return data.token ?? null
    } catch {
      return null
    }
  }

  async connect(email: string, overrideURL?: string) {
    this.disconnect(false)
    this.connecting = true
    this.error = ''

    const token = await this.fetchToken()
    if (!token) {
      this.error = 'Failed to get authentication token'
      this.connecting = false
      return
    }

    await this.fetchConfig()
    const domain = email.split('@')[1] || location.hostname
    const url = overrideURL || this.wsURL || `wss://${domain}:5443/ws`
    const jid = email

    this.myJid = jid
    this.attemptedURL = url

    this.client = XMPP.createClient({
      jid,
      password: token,
      transports: { websocket: url },
    })

    // Force PLAIN auth — JWT must be sent as raw password, not hashed by SCRAM or wrapped in X-OAUTH2
    this.client.sasl.disable('SCRAM-SHA-1')
    this.client.sasl.disable('SCRAM-SHA-1-PLUS')
    this.client.sasl.disable('SCRAM-SHA-256')
    this.client.sasl.disable('SCRAM-SHA-256-PLUS')
    this.client.sasl.disable('SCRAM-SHA-512')
    this.client.sasl.disable('SCRAM-SHA-512-PLUS')
    this.client.sasl.disable('SCRAM-SHA3-512')
    this.client.sasl.disable('SCRAM-SHA3-512-PLUS')
    this.client.sasl.disable('DIGEST-MD5')
    this.client.sasl.disable('X-OAUTH2')

    this.client.on('session:started', async () => {
      this.connected = true
      this.connecting = false
      this.error = ''
      this.reconnectAttempts = 0
      this.reconnectDelay = 2000
      try {
        this.omemoManager = new OmemoManager()
        await this.omemoManager.init(this.client!, bareJid(this.myJid))
        console.log('OMEMO initialized, device id:', this.omemoManager.getDeviceId())
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error('Failed to initialize OMEMO:', e)
        error(`OMEMO initialization failed: ${msg}`)
        this.omemoManager = null
      }
      try {
        const roster = await this.client!.getRoster()
        const items: RosterItem[] = (roster.items || []).map((item: any) => ({
          jid: bareJid(item.jid || ''),
          name: item.name || undefined,
          subscription: item.subscription || undefined,
          presence: 'unavailable',
          status: '',
        }))
        const selfJid = bareJid(this.myJid)
        if (selfJid && !items.some((item) => item.jid === selfJid)) {
          items.push({
            jid: selfJid,
            name: 'Me',
            subscription: 'both',
            presence: 'available',
            status: '',
          })
        }
        this.roster = items
      } catch (e) {
        console.error('Failed to get roster:', e)
      }
      try {
        const bookmarks = await this.client!.getBookmarks()
        const bookmarkRooms: Room[] = (bookmarks || []).map((b: any) => ({
          jid: typeof b.jid === 'string' ? b.jid : b.jid?.toString() || '',
          name: b.name || undefined,
          nick: b.nick || '',
          joined: false,
        }))
        this.rooms = bookmarkRooms
        for (const room of bookmarkRooms) {
          if (room.nick) {
            try {
              await this.client!.joinRoom(room.jid, room.nick)
              room.joined = true
            } catch (e) {
              console.error('Failed to auto-join room:', room.jid, e)
            }
          }
        }
      } catch (e) {
        console.error('Failed to get bookmarks:', e)
      }
      try {
        if (typeof (this.client as any).enableCarbons === 'function') {
          await (this.client as any).enableCarbons()
        } else {
          await this.client!.sendIQ({
            type: 'set',
            carbons: { action: 'enable' },
          } as any)
        }
        console.log('Message carbons enabled')
      } catch (e) {
        console.error('Failed to enable message carbons:', e)
      }
      this.client!.sendPresence()

      if (this.selectedJid) {
        this.historyFetched.delete(this.selectedJid)
        this.historyLoading.delete(this.selectedJid)
        this.fetchHistory(this.selectedJid, this.selectedIsRoom)
      }
    })

    this.client.on('disconnected', (reason?: Error) => {
      const wasConnected = this.connected
      this.connected = false
      this.connecting = false
      this.client = null
      if (reason) {
        const msg = reason.message || String(reason)
        console.error('Jabber disconnected:', msg, 'URL:', this.attemptedURL)
        this.error = `Disconnected: ${msg} (${this.attemptedURL})`
      }
      if (wasConnected) {
        this.scheduleReconnect(email)
      }
    })

    this.client.on('auth:failed', () => {
      this.error = 'Authentication failed'
      this.connecting = false
      this.connected = false
      this.scheduleReconnect(email)
    })

    this.client.on('stream:error', (err: any) => {
      const condition = err?.condition || 'Stream error'
      const text = err?.text || ''
      this.error = `${condition}${text ? ': ' + text : ''} (${this.attemptedURL})`
      console.error('Jabber stream error:', condition, text, 'URL:', this.attemptedURL)
      this.connecting = false
    })

    this.client.on('message', async (msg: Stanzas.ReceivedMessage) => {
      if ((msg as any).carbon) {
        return
      }

      if (msg.type === 'groupchat') {
        if (msg.body) {
          this.addMessage({
            id: msg.id || Math.random().toString(36).slice(2),
            from: bareJid(msg.from || ''),
            to: bareJid(msg.to || ''),
            body: msg.body,
            timestamp: new Date(),
            incoming: true,
            type: 'groupchat',
          })
        }
        return
      }

      const hasPayload = msg.body || msg.omemo
      if (hasPayload && (msg.type === 'chat' || msg.type === 'normal' || !msg.type)) {
        await this.handleChatMessage(msg)
      }
    })

    this.client.on('carbon:received', async (msg: any) => {
      const forwarded = msg.carbon?.forward?.message as Stanzas.ReceivedMessage | undefined
      if (forwarded) {
        await this.handleChatMessage(forwarded)
      }
    })

    this.client.on('carbon:sent', async (msg: any) => {
      const forwarded = msg.carbon?.forward?.message as Stanzas.ReceivedMessage | undefined
      if (forwarded) {
        await this.handleChatMessage(forwarded)
      }
    })

    this.client.on('roster:update', (data: any) => {
      const items: RosterItem[] = (data.items || []).map((item: any) => ({
        jid: bareJid(item.jid || ''),
        name: item.name || undefined,
        subscription: item.subscription || undefined,
        presence: 'unavailable',
        status: '',
      }))
      const selfJid = bareJid(this.myJid)
      if (selfJid && !items.some((item) => item.jid === selfJid)) {
        items.push({
          jid: selfJid,
          name: 'Me',
          subscription: 'both',
          presence: 'available',
          status: '',
        })
      }
      this.roster = items
    })

    this.client.on('presence', (presence: any) => {
      const from = bareJid(presence.from || '')
      const show = presence.show || (presence.type === 'unavailable' ? 'unavailable' : 'available')
      const status = presence.status || ''
      this.roster = this.roster.map((item) => {
        if (item.jid === from) {
          return { ...item, presence: show, status }
        }
        return item
      })
    })

    // Disable live re-pruning of device-list updates. Other clients can
    // legitimately republish stale ids, causing an endless prune/republish
    // loop. Initial pruning on connect is still done in OmemoManager.init().

    // Enable raw XML logging for debugging
    ;(this.client as any).on('raw:incoming', (data: string) => {
      console.log('XMPP IN:', data)
    })
    ;(this.client as any).on('raw:outgoing', (data: string) => {
      console.log('XMPP OUT:', data)
    })

    try {
      this.client.connect()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Connection failed'
      this.error = `${msg} (${this.attemptedURL})`
      console.error('Jabber connect error:', msg, 'URL:', this.attemptedURL)
      this.connecting = false
      this.client = null
      this.scheduleReconnect(email)
    }
  }

  private scheduleReconnect(email: string) {
    if (this.reconnectTimer) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.error =
        'Connection failed after 5 attempts. Check server config or wait for fail2ban to clear.'
      this.connecting = false
      return
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect(email)
    }, this.reconnectDelay)
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay)
    this.reconnectAttempts++
    if (this.reconnectAttempts > 1) {
      error(`Jabber disconnected. Reconnecting in ${this.reconnectDelay / 1000}s…`)
    }
  }

  async fetchOmemoBundle(): Promise<OmemoBundle | null> {
    try {
      const response = await fetch('/api/v1/profile/omemo', {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) return null
      const data = await response.json()
      return data.bundle ?? null
    } catch {
      return null
    }
  }

  async saveOmemoBundle(bundle: OmemoBundle | null): Promise<void> {
    try {
      await fetch('/api/v1/profile/omemo', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bundle }),
      })
    } catch (e) {
      console.error('Failed to save OMEMO bundle:', e)
    }
  }

  disconnect(clearMessages = true) {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.client) {
      try {
        this.client.disconnect()
      } catch {
        // ignore
      }
      this.client = null
    }
    this.connected = false
    this.connecting = false
    this.roster = []
    this.rooms = []
    this.historyFetched = new Set()
    this.historyLoading = new Set()
    if (clearMessages) {
      this.messages = {}
      this.selectedJid = null
      this.selectedIsRoom = false
    }
  }

  private cleanupPendingSelfOmemo() {
    const cutoff = Date.now() - this.pendingSelfOmemoMaxAge
    for (const [id, entry] of this.pendingSelfOmemo) {
      if (entry.time < cutoff) {
        this.pendingSelfOmemo.delete(id)
      }
    }
  }

  private addMessage(msg: ChatMessage, roomJid?: string) {
    const key = roomJid || (msg.incoming ? msg.from : msg.to)
    console.log('addMessage', {
      key,
      id: msg.id,
      incoming: msg.incoming,
      body: msg.body.substring(0, 40),
    })
    const existing = this.messages[key] || []
    if (existing.some((m) => m.id === msg.id)) return
    const merged = [...existing, msg].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    this.messages = { ...this.messages, [key]: merged }
  }

  private async handleChatMessage(msg: Stanzas.ReceivedMessage) {
    const from = bareJid(msg.from || '')
    const to = bareJid(msg.to || '')
    const isOutgoing = from === bareJid(this.myJid)
    console.log('handleChatMessage', {
      from,
      to,
      isOutgoing,
      hasOmemo: !!msg.omemo,
      hasBody: !!msg.body,
    })

    let body = msg.body
    let encrypted = false
    let decryptionFailed = false

    if (msg.omemo) {
      encrypted = true
      if (this.omemoManager) {
        const payload = this.omemoManager.parseStanzaPayload(msg)
        if (payload) {
          const isSelf = isOutgoing && from === to
          const pending = isSelf ? this.pendingSelfOmemo.get(msg.id || '') : undefined
          if (pending) {
            body = pending.body
            this.pendingSelfOmemo.delete(msg.id || '')
          } else {
            const decrypted = await this.omemoManager.decrypt(from, payload)
            if (decrypted !== null) {
              body = decrypted
            } else {
              body = '[Unable to decrypt OMEMO message]'
              decryptionFailed = true
            }
          }
        }
      } else {
        body = '[OMEMO message — unable to decrypt]'
        decryptionFailed = true
      }
    }

    if (!body) return

    this.addMessage({
      id: msg.id || Math.random().toString(36).slice(2),
      from: isOutgoing ? bareJid(this.myJid) : from,
      to: isOutgoing ? to : bareJid(this.myJid),
      body,
      timestamp: new Date(),
      incoming: !isOutgoing,
      type: 'chat',
      ...(encrypted ? { encrypted: true } : {}),
      ...(decryptionFailed ? { decryptionFailed: true } : {}),
    })

    if (!isOutgoing) {
      const name = this.roster.find((r) => r.jid === from)?.name
      if (!this.selectedJid || this.selectedJid !== from) {
        notification(`Message from ${name || msg.from}: ${body.substring(0, 60)}`)
      }
    }

    if (isOutgoing && to === from && !this.selectedJid) {
      this.selectJid(to, false)
    }
  }

  isHistoryLoading(jid: string): boolean {
    return this.historyLoading.has(jid)
  }

  async fetchHistory(jid: string, isRoom = false) {
    if (
      !this.client ||
      !this.connected ||
      this.historyFetched.has(jid) ||
      this.historyLoading.has(jid)
    ) {
      return
    }

    const archiveJid = isRoom ? jid : bareJid(this.myJid)
    if (!archiveJid) return

    this.historyLoading = new Set([...this.historyLoading, jid])
    try {
      const result = await this.client.searchHistory(archiveJid, {
        ...(isRoom ? {} : { with: jid }),
        paging: { max: 50 },
      })

      for (const item of result.results || []) {
        const forward = item.item
        const msg = forward.message
        if (!msg?.body) continue

        const delay = forward.delay || (msg as any).delay
        const timestamp = delay?.timestamp ? new Date(delay.timestamp) : new Date()
        const type: 'chat' | 'groupchat' = isRoom ? 'groupchat' : 'chat'

        let from = bareJid(msg.from || '')
        let isIncoming = bareJid(msg.from || '') !== bareJid(this.myJid)
        if (isRoom) {
          const parts = (msg.from || '').split('/')
          const nick = parts.length > 1 ? parts.slice(1).join('/') : ''
          from = nick || from
          const room = this.rooms.find((r) => r.jid === jid)
          isIncoming = nick !== (room?.nick || '')
        }

        this.addMessage(
          {
            id: item.id || msg.id || Math.random().toString(36).slice(2),
            from,
            to: bareJid(msg.to || ''),
            body: msg.body,
            timestamp,
            incoming: isIncoming,
            type,
          },
          isRoom ? jid : undefined,
        )
      }
      this.historyFetched = new Set([...this.historyFetched, jid])
    } catch (e) {
      console.error('Failed to fetch history for', jid, e)
    } finally {
      const next = new Set(this.historyLoading)
      next.delete(jid)
      this.historyLoading = next
    }
  }

  async joinRoom(jid: string, nick: string) {
    if (!this.client || !this.connected) return
    try {
      await this.client.joinRoom(jid, nick)
      if (!this.rooms.find((r) => r.jid === jid)) {
        this.rooms = [...this.rooms, { jid, name: jid.split('@')[0], nick, joined: true }]
      }
    } catch {
      error(`Failed to join ${jid}`)
    }
  }

  leaveRoom(jid: string) {
    if (!this.client || !this.connected) return
    const room = this.rooms.find((r) => r.jid === jid)
    if (room) {
      this.client.leaveRoom(jid, room.nick)
      this.rooms = this.rooms.filter((r) => r.jid !== jid)
      if (this.selectedJid === jid) {
        this.selectedJid = null
        this.selectedIsRoom = false
      }
    }
  }

  async sendRoomMessage(roomJid: string, body: string) {
    if (!this.client || !this.connected) return
    const room = this.rooms.find((r) => r.jid === roomJid)
    if (!room) return
    const id = Math.random().toString(36).slice(2)

    if (this.omemoEnabled[roomJid] && this.omemoManager) {
      // TODO: MUC OMEMO requires encrypting for all participant devices.
      // For now fall back to plaintext with a console warning.
      console.warn('MUC OMEMO not yet implemented; sending plaintext')
    }

    this.client.sendMessage({ to: roomJid, body, id, type: 'groupchat' })
    this.addMessage(
      {
        id,
        from: room.nick,
        to: roomJid,
        body,
        timestamp: new Date(),
        incoming: false,
        type: 'groupchat',
      },
      roomJid,
    )
  }

  isOmemoEnabled(jid: string): boolean {
    return this.omemoEnabled[jid] !== false
  }

  async sendMessage(to: string, body: string) {
    if (!this.client || !this.connected) return
    const id = Math.random().toString(36).slice(2)
    const toBare = bareJid(to)

    console.log('sendMessage', {
      toBare,
      omemoEnabled: this.isOmemoEnabled(toBare),
      hasManager: !!this.omemoManager,
    })

    if (this.isOmemoEnabled(toBare) && this.omemoManager) {
      const encrypted = await this.omemoManager.encrypt(toBare, body)
      console.log('encrypt result', { encrypted: !!encrypted })
      if (encrypted) {
        if (toBare === bareJid(this.myJid)) {
          this.pendingSelfOmemo.set(id, { body, time: Date.now() })
          this.cleanupPendingSelfOmemo()
        }
        this.client.sendMessage({
          to,
          id,
          omemo: this.omemoManager.buildStanzaPayload(encrypted) as any,
        })
        this.addMessage({
          id,
          from: bareJid(this.myJid),
          to: toBare,
          body,
          timestamp: new Date(),
          incoming: false,
          type: 'chat',
          encrypted: true,
        })
        return
      }
      console.warn(`OMEMO encryption unavailable for ${toBare}; falling back to plaintext`)
    }

    this.client.sendMessage({ to, body, id })
    this.addMessage({
      id,
      from: bareJid(this.myJid),
      to: toBare,
      body,
      timestamp: new Date(),
      incoming: false,
      type: 'chat',
    })
  }

  toggleOmemo(jid: string) {
    this.omemoEnabled = { ...this.omemoEnabled, [jid]: !this.isOmemoEnabled(jid) }
  }

  selectJid(jid: string | null, isRoom = false) {
    this.selectedJid = jid
    this.selectedIsRoom = isRoom
    if (jid) {
      this.fetchHistory(jid, isRoom)
    }
  }

  getMessages(jid: string): ChatMessage[] {
    return this.messages[jid] || []
  }
}

export const jabberStore = new JabberStore()
