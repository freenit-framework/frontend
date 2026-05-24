export interface ChatMessage {
  id: string
  from: string
  to: string
  body: string
  timestamp: Date
  incoming: boolean
  type?: 'chat' | 'groupchat'
}

export interface RosterItem {
  jid: string
  name?: string
  subscription?: string
  presence?: 'available' | 'away' | 'dnd' | 'xa' | 'unavailable'
  status?: string
}

export interface Room {
  jid: string
  name?: string
  nick: string
  joined: boolean
}

export interface OmemoBundle {
  identityKey: string
  signedPreKey: string
  preKeys: string[]
  registrationId: number
  deviceId: number
}
