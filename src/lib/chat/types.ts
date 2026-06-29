export interface ChatMessage {
  id: string
  from: string
  to: string
  body: string
  timestamp: Date
  incoming: boolean
  type?: 'chat' | 'groupchat'
  encrypted?: boolean
  decryptionFailed?: boolean
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

export type CallStatus = 'idle' | 'incoming' | 'outgoing' | 'connected' | 'rejected' | 'ended'

export interface CallSignal {
  type: 'offer' | 'answer' | 'candidate' | 'reject' | 'end'
  sdp?: string
  candidate?: RTCIceCandidateInit | null
}

export interface CallState {
  status: CallStatus
  peerJid: string | null
  error: string | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
}
