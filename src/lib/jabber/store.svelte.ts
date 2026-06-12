import * as XMPP from 'stanza'
import type { Agent, Stanzas } from 'stanza'
import type { ChatMessage, OmemoBundle, RosterItem, Room } from './types'
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

  // Reconnect state
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectDelay = 2000
  private reconnectAttempts = 0
  private maxReconnectDelay = 30000
  private maxReconnectAttempts = 5

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
        const roster = await this.client!.getRoster()
        const items: RosterItem[] = (roster.items || []).map((item: any) => ({
          jid: bareJid(item.jid || ''),
          name: item.name || undefined,
          subscription: item.subscription || undefined,
          presence: 'unavailable',
          status: '',
        }))
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
      this.client!.sendPresence()
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

    this.client.on('chat', (msg: Stanzas.ReceivedMessage) => {
      if (msg.body) {
        this.addMessage({
          id: msg.id || Math.random().toString(36).slice(2),
          from: bareJid(msg.from || ''),
          to: bareJid(msg.to || ''),
          body: msg.body,
          timestamp: new Date(),
          incoming: true,
        })
        const name = this.roster.find((r) => r.jid === bareJid(msg.from || ''))?.name
        if (!this.selectedJid || this.selectedJid !== bareJid(msg.from || '')) {
          notification(`Message from ${name || msg.from}: ${msg.body.substring(0, 60)}`)
        }
      }
    })

    this.client.on('message', (msg: Stanzas.ReceivedMessage) => {
      if (msg.body && msg.type === 'groupchat') {
        this.addMessage({
          id: msg.id || Math.random().toString(36).slice(2),
          from: bareJid(msg.from || ''),
          to: bareJid(msg.to || ''),
          body: msg.body,
          timestamp: new Date(),
          incoming: true,
        })
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

  private addMessage(msg: ChatMessage, roomJid?: string) {
    const key = roomJid || (msg.incoming ? msg.from : msg.to)
    const existing = this.messages[key] || []
    if (existing.some((m) => m.id === msg.id)) return
    const merged = [...existing, msg].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    this.messages = { ...this.messages, [key]: merged }
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
    } catch (e) {
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

  sendRoomMessage(roomJid: string, body: string) {
    if (!this.client || !this.connected) return
    const room = this.rooms.find((r) => r.jid === roomJid)
    if (!room) return
    const id = Math.random().toString(36).slice(2)
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

  sendMessage(to: string, body: string) {
    if (!this.client || !this.connected) return
    const id = Math.random().toString(36).slice(2)
    this.client.sendMessage({ to, body, id })
    this.addMessage({
      id,
      from: bareJid(this.myJid),
      to: bareJid(to),
      body,
      timestamp: new Date(),
      incoming: false,
      type: 'chat',
    })
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
