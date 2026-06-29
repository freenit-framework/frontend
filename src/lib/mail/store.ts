import { writable, derived, get } from 'svelte/store'
import { notification } from '../notification'
import type {
  Mailbox,
  MailboxNode,
  Email,
  JMAPSession,
  Identity,
  ComposeParams,
  EmailAddress,
} from './types'

// WebSocket push
let ws: WebSocket | null = null
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null
let wsReconnectDelay = 1000
let currentPath = ''

export function setMailCurrentPath(path: string) {
  currentPath = path
}

async function refreshSession() {
  try {
    const response = await fetch('/api/v1/mail/jmap/session', {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return
    jmapSession.set(await response.json())
  } catch {
    /* non-fatal */
  }
}

export function connectMailWebSocket() {
  if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) return
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  ws = new WebSocket(`${proto}//${location.host}/api/v1/mail/jmap/ws`)

  ws.onopen = async () => {
    wsReconnectDelay = 1000
    // Re-fetch session on reconnect in case server restarted and accountIds changed
    await refreshSession()
    ws!.send(
      JSON.stringify({
        '@type': 'WebSocketPushEnable',
        dataTypes: ['Email', 'Mailbox', 'Thread', 'EmailDelivery'],
        pushState: null,
      }),
    )
  }

  ws.onmessage = async (ev) => {
    try {
      const msg = JSON.parse(ev.data as string)
      if (msg['@type'] === 'StateChange') await handleStateChange(msg.changed ?? {})
    } catch {
      /* ignore malformed frames */
    }
  }

  ws.onclose = () => {
    ws = null
    wsReconnectTimer = setTimeout(() => {
      wsReconnectTimer = null
      connectMailWebSocket()
    }, wsReconnectDelay)
    wsReconnectDelay = Math.min(wsReconnectDelay * 2, 30000)
  }

  ws.onerror = () => ws?.close()
}

export function disconnectMailWebSocket() {
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer)
    wsReconnectTimer = null
  }
  ws?.close()
  ws = null
}

async function handleStateChange(changed: Record<string, Record<string, string>>) {
  const accountId = get(primaryAccountId)
  // Match on any account if our primary isn't listed (impersonation may shift ids)
  const changes = accountId
    ? (changed[accountId] ?? Object.values(changed)[0])
    : Object.values(changed)[0]
  if (!changes) return

  if ('Mailbox' in changes) await fetchMailboxes()

  const mailboxId = get(selectedMailboxId)
  if ('Email' in changes && mailboxId) await fetchEmails(mailboxId)

  if ('EmailDelivery' in changes && currentPath !== '/mail') {
    notification('New email received')
  }
}

// Data
export const jmapSession = writable<JMAPSession | null>(null)
export const mailboxes = writable<Mailbox[]>([])
export const emails = writable<Email[]>([])
export const emailContent = writable<Record<string, Email>>({})
export const identities = writable<Identity[]>([])
export const selectedMailboxId = writable<string | null>(null)
export const selectedEmailId = writable<string | null>(null)
export const composeParams = writable<ComposeParams | null>(null)

// UI
export const mailLoading = writable(false)
export const emailsLoading = writable(false)
export const mailError = writable<string | null>(null)

// Derived
export const primaryAccountId = derived(jmapSession, (session) => {
  if (!session) return null
  return (
    session.primaryAccounts['urn:ietf:params:jmap:mail'] ?? Object.keys(session.accounts)[0] ?? null
  )
})

export const selectedMailbox = derived(
  [mailboxes, selectedMailboxId],
  ([$mailboxes, $id]) => $mailboxes.find((m) => m.id === $id) ?? null,
)

export const selectedEmail = derived(
  [emails, selectedEmailId],
  ([$emails, $id]) => $emails.find((e) => e.id === $id) ?? null,
)

export const inboxMailbox = derived(
  mailboxes,
  ($mailboxes) => $mailboxes.find((m) => m.role === 'inbox') ?? null,
)

function sortMailboxes(nodes: MailboxNode[]): MailboxNode[] {
  return nodes.sort((a, b) => {
    const ap = ROLE_ORDER[a.role ?? ''] ?? 10
    const bp = ROLE_ORDER[b.role ?? ''] ?? 10
    if (ap !== bp) return ap - bp
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    return a.name.localeCompare(b.name)
  })
}

export const mailboxTree = derived(mailboxes, ($mailboxes) => {
  const map = new Map<string, MailboxNode>()

  for (const m of $mailboxes) {
    map.set(m.id, { ...m, children: [] })
  }

  for (const m of $mailboxes) {
    const node = map.get(m.id)!
    if (m.parentId && map.has(m.parentId)) {
      map.get(m.parentId)!.children.push(node)
    }
  }

  for (const node of map.values()) {
    node.children = sortMailboxes(node.children)
  }

  const roots: MailboxNode[] = []
  for (const m of $mailboxes) {
    const node = map.get(m.id)!
    if (!m.parentId || !map.has(m.parentId)) {
      roots.push(node)
    }
  }

  return sortMailboxes(roots)
})

export function flattenMailboxOptions(
  nodes: MailboxNode[],
  prefix = '',
): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = []
  for (const node of nodes) {
    const path = prefix ? `${prefix}/${node.name}` : node.name
    options.push({ value: path, label: path })
    options.push(...flattenMailboxOptions(node.children, path))
  }
  return options.sort((a, b) => a.value.localeCompare(b.value))
}

// JMAP request — auth is handled server-side via the freenit session cookie
async function jmapRequest(methodCalls: unknown[]): Promise<{
  methodResponses: Array<[string, Record<string, unknown>, string]>
}> {
  const response = await fetch('/api/v1/mail/jmap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      using: [
        'urn:ietf:params:jmap:core',
        'urn:ietf:params:jmap:mail',
        'urn:ietf:params:jmap:submission',
      ],
      methodCalls,
    }),
  })

  if (response.status === 401 || response.status === 403) {
    throw new Error('session_expired')
  }
  if (!response.ok) {
    throw new Error(`JMAP error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

function getResponseList<T>(
  result: { methodResponses: Array<[string, Record<string, unknown>, string]> },
  name: string,
): T[] {
  const r = result.methodResponses.find((r) => r[0] === name)
  return ((r?.[1] as { list?: T[] })?.list ?? []) as T[]
}

const ROLE_ORDER: Record<string, number> = {
  inbox: 0,
  sent: 1,
  drafts: 2,
  junk: 3,
  trash: 4,
  archive: 5,
}

export async function initMail(): Promise<void> {
  mailLoading.set(true)
  mailError.set(null)
  try {
    const response = await fetch('/api/v1/mail/jmap/session', {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`Session error: ${response.status}`)
    jmapSession.set(await response.json())
    await Promise.all([fetchMailboxes(), fetchIdentities()])
    connectMailWebSocket()
  } catch (e) {
    mailError.set(e instanceof Error ? e.message : 'Failed to connect to mail server')
  } finally {
    mailLoading.set(false)
  }
}

export async function fetchMailFolders(): Promise<void> {
  mailError.set(null)
  try {
    const response = await fetch('/api/v1/mail/jmap/session', {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`Session error: ${response.status}`)
    const session: JMAPSession = await response.json()
    jmapSession.set(session)

    const accountId =
      session.primaryAccounts['urn:ietf:params:jmap:mail'] ??
      Object.keys(session.accounts)[0] ??
      null
    if (!accountId) return

    const result = await jmapRequest([['Mailbox/get', { accountId, ids: null }, 'mailboxes']])
    const list = getResponseList<Mailbox>(result, 'Mailbox/get')
    const sorted = list.sort((a, b) => {
      const ap = ROLE_ORDER[a.role ?? ''] ?? 10
      const bp = ROLE_ORDER[b.role ?? ''] ?? 10
      return ap !== bp ? ap - bp : a.sortOrder - b.sortOrder
    })
    mailboxes.set(sorted)
  } catch (e) {
    mailError.set(e instanceof Error ? e.message : 'Failed to load mail folders')
  }
}

export async function fetchMailboxes(): Promise<void> {
  const accountId = get(primaryAccountId)
  if (!accountId) return

  try {
    const result = await jmapRequest([['Mailbox/get', { accountId, ids: null }, 'mailboxes']])
    const list = getResponseList<Mailbox>(result, 'Mailbox/get')
    const sorted = list.sort((a, b) => {
      const ap = ROLE_ORDER[a.role ?? ''] ?? 10
      const bp = ROLE_ORDER[b.role ?? ''] ?? 10
      return ap !== bp ? ap - bp : a.sortOrder - b.sortOrder
    })
    mailboxes.set(sorted)

    if (!get(selectedMailboxId)) {
      const inbox = sorted.find((m) => m.role === 'inbox')
      if (inbox) {
        selectedMailboxId.set(inbox.id)
        await fetchEmails(inbox.id, true)
      }
    }
  } catch (e) {
    mailError.set(e instanceof Error ? e.message : 'Failed to load mailboxes')
  }
}

export async function fetchEmails(mailboxId: string, resetSelection = false): Promise<void> {
  const accountId = get(primaryAccountId)
  if (!accountId) return

  emailsLoading.set(true)
  mailError.set(null)
  emails.set([])
  if (resetSelection) selectedEmailId.set(null)

  try {
    const result = await jmapRequest([
      [
        'Email/query',
        {
          accountId,
          filter: { inMailbox: mailboxId },
          sort: [{ property: 'receivedAt', isAscending: false }],
          limit: 50,
          position: 0,
        },
        'emailIds',
      ],
      [
        'Email/get',
        {
          accountId,
          '#ids': { resultOf: 'emailIds', name: 'Email/query', path: '/ids' },
          properties: [
            'id',
            'threadId',
            'mailboxIds',
            'keywords',
            'from',
            'to',
            'subject',
            'receivedAt',
            'preview',
            'hasAttachment',
            'size',
          ],
        },
        'emails',
      ],
    ])
    emails.set(getResponseList<Email>(result, 'Email/get'))
  } catch (e) {
    mailError.set(e instanceof Error ? e.message : 'Failed to load emails')
  } finally {
    emailsLoading.set(false)
  }
}

export async function fetchEmailContent(emailId: string): Promise<Email | null> {
  const cached = get(emailContent)[emailId]
  if (cached) return cached

  const accountId = get(primaryAccountId)
  if (!accountId) return null

  try {
    const result = await jmapRequest([
      [
        'Email/get',
        {
          accountId,
          ids: [emailId],
          properties: [
            'id',
            'threadId',
            'mailboxIds',
            'keywords',
            'from',
            'to',
            'cc',
            'bcc',
            'replyTo',
            'inReplyTo',
            'references',
            'subject',
            'header:List-ID',
            'receivedAt',
            'preview',
            'hasAttachment',
            'size',
            'bodyValues',
            'textBody',
            'htmlBody',
            'attachments',
          ],
          fetchAllBodyValues: true,
          maxBodyValueBytes: 2 * 1024 * 1024,
        },
        'email',
      ],
    ])
    const list = getResponseList<Email>(result, 'Email/get')
    if (list.length > 0) {
      const message = list[0]
      emailContent.update((cache) => ({ ...cache, [message.id]: message }))
      return message
    }
  } catch (e) {
    mailError.set(e instanceof Error ? e.message : 'Failed to load email')
  }
  return null
}

export async function fetchIdentities(): Promise<void> {
  const accountId = get(primaryAccountId)
  if (!accountId) return

  try {
    const result = await jmapRequest([['Identity/get', { accountId, ids: null }, 'identities']])
    identities.set(getResponseList<Identity>(result, 'Identity/get'))
  } catch {
    // Non-fatal
  }
}

export async function markAsRead(emailId: string, read: boolean): Promise<void> {
  const accountId = get(primaryAccountId)
  if (!accountId) return

  try {
    await jmapRequest([
      [
        'Email/set',
        {
          accountId,
          update: { [emailId]: { 'keywords/$seen': read ? true : null } },
        },
        'update',
      ],
    ])
    emails.update((list) =>
      list.map((e) => {
        if (e.id !== emailId) return e
        const keywords = { ...e.keywords }
        if (read) keywords['$seen'] = true
        else delete keywords['$seen']
        return { ...e, keywords }
      }),
    )
  } catch (e) {
    mailError.set(e instanceof Error ? e.message : 'Failed to update email')
  }
}

export async function moveEmail(emailId: string, targetMailboxId: string): Promise<void> {
  const accountId = get(primaryAccountId)
  if (!accountId) return

  try {
    await jmapRequest([
      [
        'Email/set',
        {
          accountId,
          update: { [emailId]: { mailboxIds: { [targetMailboxId]: true } } },
        },
        'move',
      ],
    ])
    emails.update((list) => list.filter((e) => e.id !== emailId))
    selectedEmailId.update((id) => (id === emailId ? null : id))
  } catch (e) {
    mailError.set(e instanceof Error ? e.message : 'Failed to move email')
  }
}

export async function deleteEmail(emailId: string): Promise<void> {
  const trash = get(mailboxes).find((m) => m.role === 'trash')
  if (trash) {
    await moveEmail(emailId, trash.id)
    return
  }
  const accountId = get(primaryAccountId)
  if (!accountId) return

  try {
    await jmapRequest([['Email/set', { accountId, destroy: [emailId] }, 'destroy']])
    emails.update((list) => list.filter((e) => e.id !== emailId))
    selectedEmailId.update((id) => (id === emailId ? null : id))
  } catch (e) {
    mailError.set(e instanceof Error ? e.message : 'Failed to delete email')
  }
}

export async function deleteMailbox(mailboxId: string): Promise<void> {
  const accountId = get(primaryAccountId)
  if (!accountId) return

  const mailbox = get(mailboxes).find((item) => item.id === mailboxId)
  if (!mailbox || mailbox.role) return

  try {
    const result = await jmapRequest([
      ['Mailbox/set', { accountId, destroy: [mailboxId] }, 'destroyMailbox'],
    ])
    const response = result.methodResponses.find((item) => item[2] === 'destroyMailbox')
    if (response?.[0] === 'error') {
      throw new Error(
        String(response[1].description ?? response[1].type ?? 'Mailbox deletion failed'),
      )
    }
    const notDestroyed = (
      response?.[1] as { notDestroyed?: Record<string, { description?: string; type?: string }> }
    )?.notDestroyed?.[mailboxId]
    if (notDestroyed) {
      throw new Error(notDestroyed.description ?? notDestroyed.type ?? 'Mailbox deletion failed')
    }

    mailboxes.update((list) => list.filter((item) => item.id !== mailboxId))

    if (get(selectedMailboxId) === mailboxId) {
      const fallback = get(mailboxes).find((item) => item.role === 'inbox') ?? get(mailboxes)[0]
      selectedEmailId.set(null)
      emails.set([])
      if (fallback) await selectMailbox(fallback.id)
      else selectedMailboxId.set(null)
    }
  } catch (e) {
    mailError.set(e instanceof Error ? e.message : 'Failed to delete mailbox')
  }
}

async function uploadFile(
  accountId: string,
  file: File,
): Promise<{ blobId: string; type: string; size: number }> {
  const response = await fetch(`/api/v1/mail/jmap/upload/${encodeURIComponent(accountId)}`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  })
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`)
  }
  const result = await response.json()
  return {
    blobId: result.blobId,
    type: result.type || file.type || 'application/octet-stream',
    size: result.size ?? file.size,
  }
}

export async function sendEmail(params: {
  identityId: string
  from: EmailAddress
  to: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  subject: string
  textBody?: string
  htmlBody?: string
  inReplyTo?: string[]
  references?: string[]
  attachments?: File[]
}): Promise<void> {
  const accountId = get(primaryAccountId)
  if (!accountId) throw new Error('Not connected to mail server')

  mailError.set(null)
  try {
    const sentMailbox = get(mailboxes).find((m) => m.role === 'sent')
    const bodyValues: Record<string, { value: string }> = {}
    const textBody: unknown[] = []
    const htmlBody: unknown[] = []

    if (params.htmlBody) {
      bodyValues['html'] = { value: params.htmlBody }
      htmlBody.push({ partId: 'html', type: 'text/html' })
    }
    if (params.textBody || !params.htmlBody) {
      bodyValues['text'] = { value: params.textBody ?? '' }
      textBody.push({ partId: 'text', type: 'text/plain' })
    }

    const emailCreate: Record<string, unknown> = {
      from: [params.from],
      to: params.to,
      subject: params.subject,
      keywords: { $seen: true },
      mailboxIds: sentMailbox ? { [sentMailbox.id]: true } : {},
      bodyValues,
      textBody,
      htmlBody,
    }
    if (params.cc?.length) emailCreate.cc = params.cc
    if (params.bcc?.length) emailCreate.bcc = params.bcc
    if (params.inReplyTo?.length) emailCreate.inReplyTo = params.inReplyTo
    if (params.references?.length) emailCreate.references = params.references

    if (params.attachments?.length) {
      const uploaded = await Promise.all(
        params.attachments.map((file) => uploadFile(accountId, file)),
      )
      emailCreate.attachments = uploaded.map((u, i) => ({
        blobId: u.blobId,
        type: u.type,
        name: params.attachments![i].name,
        size: u.size,
        disposition: 'attachment',
      }))
    }

    const rcptTo = [...params.to, ...(params.cc ?? []), ...(params.bcc ?? [])].map((a) => ({
      email: a.email,
    }))

    await jmapRequest([
      ['Email/set', { accountId, create: { draft: emailCreate } }, 'createEmail'],
      [
        'EmailSubmission/set',
        {
          accountId,
          create: {
            send: {
              emailId: '#draft',
              identityId: params.identityId,
              envelope: { mailFrom: { email: params.from.email }, rcptTo },
            },
          },
        },
        'submit',
      ],
    ])
  } catch (e) {
    mailError.set(e instanceof Error ? e.message : 'Failed to send email')
    throw e
  }
}

export async function selectMailbox(mailboxId: string): Promise<void> {
  selectedMailboxId.set(mailboxId)
  await fetchEmails(mailboxId, true)
}

export async function selectEmail(emailId: string): Promise<void> {
  selectedEmailId.set(emailId)
  await markAsRead(emailId, true)
  await fetchEmailContent(emailId)
}
