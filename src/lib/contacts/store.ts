import { writable, derived, get } from 'svelte/store'
import { davRequest, parseMultiStatus, extractRelPath } from '$lib/dav'
import { parseVCard, serializeVCard, splitVCards } from './vcard'
import type { Addressbook, Contact } from './types'

export const addressbooks = writable<Addressbook[]>([])
export const contacts = writable<Contact[]>([])
export const selectedContactId = writable<string | null>(null)
export const selectedAddressbookName = writable<string>('')
export const contactsLoading = writable(false)
export const contactsError = writable('')

export const selectedContact = derived(
  [contacts, selectedContactId],
  ([$contacts, $id]) => $contacts.find((c) => c.uid === $id) ?? null,
)

export const selectedAddressbook = derived(
  [addressbooks, selectedAddressbookName],
  ([$books, $name]) => $books.find((b) => b.name === $name) ?? null,
)

const LIST_BODY = `<?xml version="1.0" encoding="utf-8"?>
<D:propfind xmlns:D="DAV:">
  <D:prop>
    <D:resourcetype/>
    <D:displayname/>
  </D:prop>
</D:propfind>`

const CONTACTS_BODY = `<?xml version="1.0" encoding="utf-8"?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:carddav">
  <D:prop>
    <D:getetag/>
    <C:address-data/>
  </D:prop>
</D:propfind>`

async function fetchAddressbooks(): Promise<Addressbook[]> {
  const { status, text } = await davRequest('PROPFIND', '/card', { body: LIST_BODY, depth: '1' })
  if (status !== 207) return []

  return parseMultiStatus(text)
    .filter((r) => {
      const rel = extractRelPath(r.href, 'card')
      return rel && rel.endsWith('/') && r.props['resourcetype']?.includes('addressbook')
    })
    .map((r) => ({
      name: extractRelPath(r.href, 'card').replace(/\/$/, ''),
      displayName: r.props['displayname'] || extractRelPath(r.href, 'card').replace(/\/$/, ''),
    }))
}

async function fetchContactsFromBook(book: Addressbook): Promise<Contact[]> {
  const { status, text } = await davRequest('PROPFIND', `/card/${book.name}/`, {
    body: CONTACTS_BODY,
    depth: '1',
  })
  if (status !== 207) return []

  const results: Contact[] = []
  for (const r of parseMultiStatus(text)) {
    const rel = extractRelPath(r.href, 'card')
    if (!rel || !rel.endsWith('.vcf')) continue

    const vcardData = r.props['address-data']
    if (!vcardData) continue

    try {
      const parsed = parseVCard(vcardData)
      if (!parsed.uid) parsed.uid = rel.split('/').pop()!.replace('.vcf', '')
      results.push({
        ...parsed,
        href: `/card/${rel}`,
        etag: r.props['getetag'] ?? '',
        addressbook: book.name,
      })
    } catch (e) {
      console.warn('vCard parse error:', e)
    }
  }
  return results
}

export async function initContacts() {
  contactsLoading.set(true)
  contactsError.set('')
  try {
    const books = await fetchAddressbooks()
    addressbooks.set(books)

    selectedAddressbookName.update((current) => {
      if (current && books.some((b) => b.name === current)) return current
      return books[0]?.name ?? ''
    })

    const all: Contact[] = []
    for (const book of books) {
      all.push(...(await fetchContactsFromBook(book)))
    }
    contacts.set(all.sort((a, b) => a.displayName.localeCompare(b.displayName)))
  } catch (e) {
    contactsError.set(e instanceof Error ? e.message : 'Failed to load contacts')
  } finally {
    contactsLoading.set(false)
  }
}

export function selectAddressbook(name: string) {
  selectedAddressbookName.set(name)
  selectedContactId.set(null)
}

const MKCOL_BODY = (displayName: string) => `<?xml version="1.0" encoding="utf-8"?>
<D:mkcol xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:carddav">
  <D:set>
    <D:prop>
      <D:resourcetype>
        <D:collection/>
        <C:addressbook/>
      </D:resourcetype>
      <D:displayname>${escapeXml(displayName)}</D:displayname>
    </D:prop>
  </D:set>
</D:mkcol>`

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const PROPPATCH_DISPLAYNAME_BODY = (displayName: string) => `<?xml version="1.0" encoding="utf-8"?>
<D:propertyupdate xmlns:D="DAV:">
  <D:set>
    <D:prop>
      <D:displayname>${escapeXml(displayName)}</D:displayname>
    </D:prop>
  </D:set>
</D:propertyupdate>`

export async function createAddressbook(name: string, displayName: string): Promise<void> {
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()
  const { status } = await davRequest('MKCOL', `/card/${safeName}/`, {
    body: MKCOL_BODY(displayName || name),
    contentType: 'application/xml; charset=utf-8',
  })
  if (status >= 400) throw new Error(`Failed to create addressbook: HTTP ${status}`)
  await initContacts()
  selectAddressbook(safeName)
}

export async function deleteAddressbook(book: Addressbook): Promise<void> {
  const { status } = await davRequest('DELETE', `/card/${book.name}/`)
  if (status >= 400) throw new Error(`Failed to delete addressbook: HTTP ${status}`)
  await initContacts()
}

export async function renameAddressbook(book: Addressbook, displayName: string): Promise<void> {
  const { status } = await davRequest('PROPPATCH', `/card/${book.name}/`, {
    body: PROPPATCH_DISPLAYNAME_BODY(displayName),
    contentType: 'application/xml; charset=utf-8',
  })
  if (status >= 400) throw new Error(`Failed to rename addressbook: HTTP ${status}`)
  addressbooks.update((books) =>
    books.map((b) => (b.name === book.name ? { ...b, displayName } : b)),
  )
}

export function exportContacts(addressbook?: string): string {
  const list = get(contacts).filter(
    (c) => !addressbook || addressbook === '' || c.addressbook === addressbook,
  )
  if (list.length === 0) return ''
  return list.map((c) => serializeVCard(c)).join('\r\n\r\n')
}

export function downloadVCard(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/vcard' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function selectContact(id: string | null) {
  selectedContactId.set(id)
}

export async function saveContact(contact: Contact & { isNew?: boolean }) {
  const vcard = serializeVCard(contact)
  const headers: Record<string, string> = {}
  if (!contact.isNew && contact.etag) headers['If-Match'] = contact.etag

  const { status } = await davRequest('PUT', contact.href, {
    body: vcard,
    contentType: 'text/vcard; charset=utf-8',
    headers,
  })
  if (status >= 400) throw new Error(`Failed to save contact: HTTP ${status}`)

  await initContacts()
}

export async function deleteContact(contact: Contact) {
  const headers: Record<string, string> = {}
  if (contact.etag) headers['If-Match'] = contact.etag

  const { status } = await davRequest('DELETE', contact.href, { headers })
  if (status >= 400) throw new Error(`Failed to delete contact: HTTP ${status}`)

  contacts.update((cs) => cs.filter((c) => c.href !== contact.href))
  selectedContactId.set(null)
}

export interface ImportResult {
  imported: number
  failed: number
}

export async function importContacts(
  file: File,
  addressbook: string = get(selectedAddressbookName),
  onProgress?: (current: number, total: number) => void,
): Promise<ImportResult> {
  if (!addressbook) throw new Error('No addressbook selected')

  const text = await file.text()
  const cards = splitVCards(text)
  if (cards.length === 0) throw new Error('No vCards found in file')

  let imported = 0
  let failed = 0

  for (const [index, card] of cards.entries()) {
    try {
      const parsed = parseVCard(card)
      const displayName = parsed.displayName.trim()
      if (!displayName && !parsed.firstName && !parsed.lastName) {
        failed++
        continue
      }

      const uid = parsed.uid.trim() || crypto.randomUUID()
      const href = `/card/${addressbook}/${uid}.vcf`
      const contact: Contact & { isNew: true } = {
        uid,
        href,
        etag: '',
        addressbook,
        displayName: displayName || [parsed.firstName, parsed.lastName].filter(Boolean).join(' '),
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        emails: parsed.emails,
        phones: parsed.phones,
        org: parsed.org,
        note: parsed.note,
        isNew: true,
      }

      const vcard = serializeVCard(contact)
      const { status } = await davRequest('PUT', href, {
        body: vcard,
        contentType: 'text/vcard; charset=utf-8',
      })
      if (status >= 400) {
        failed++
      } else {
        imported++
      }
    } catch (e) {
      console.warn('Contact import failed:', e)
      failed++
    } finally {
      onProgress?.(index + 1, cards.length)
    }
  }

  if (imported > 0) {
    await initContacts()
  }

  return { imported, failed }
}
