export interface EmailAddress {
  name?: string
  email: string
}

export interface Mailbox {
  id: string
  name: string
  parentId?: string | null
  role?: string | null
  totalEmails: number
  unreadEmails: number
  sortOrder: number
  isSubscribed?: boolean
}

export interface MailboxNode extends Mailbox {
  children: MailboxNode[]
}

export interface EmailBodyPart {
  partId?: string
  blobId?: string
  size?: number
  type: string
  charset?: string
  disposition?: string | null
  name?: string | null
}

export interface EmailBodyValue {
  value: string
  isEncodingProblem?: boolean
  isTruncated?: boolean
}

export interface Email {
  id: string
  threadId: string
  mailboxIds: Record<string, boolean>
  keywords: Record<string, boolean>
  size: number
  receivedAt: string
  from?: EmailAddress[]
  to?: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  replyTo?: EmailAddress[]
  inReplyTo?: string[]
  references?: string[]
  subject?: string
  bodyValues?: Record<string, EmailBodyValue>
  textBody?: EmailBodyPart[]
  htmlBody?: EmailBodyPart[]
  attachments?: EmailBodyPart[]
  hasAttachment?: boolean
  preview?: string
}

export interface Identity {
  id: string
  name: string
  email: string
  replyTo?: EmailAddress[]
  bcc?: EmailAddress[]
  textSignature?: string
  htmlSignature?: string
  mayDelete: boolean
}

export interface JMAPAccount {
  name: string
  isPersonal: boolean
  isReadOnly: boolean
  accountCapabilities: Record<string, unknown>
}

export interface JMAPSession {
  username: string
  capabilities: Record<string, unknown>
  accounts: Record<string, JMAPAccount>
  primaryAccounts: Record<string, string>
  state: string
  apiUrl: string
  downloadUrl: string
  uploadUrl: string
  eventSourceUrl: string
}

export interface ComposeParams {
  to?: EmailAddress[]
  cc?: EmailAddress[]
  subject?: string
  body?: string
  inReplyTo?: string[]
  references?: string[]
  replyToEmail?: Email
}
