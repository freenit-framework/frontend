import { writable, derived } from 'svelte/store'
import { davRequest, parseMultiStatus, extractRelPath } from '$lib/dav'
import { parseVCard, serializeVCard } from './vcard'
import type { Addressbook, Contact } from './types'

export const addressbooks = writable<Addressbook[]>([])
export const contacts = writable<Contact[]>([])
export const selectedContactId = writable<string | null>(null)
export const contactsLoading = writable(false)
export const contactsError = writable('')

export const selectedContact = derived(
  [contacts, selectedContactId],
  ([$contacts, $id]) => $contacts.find((c) => c.uid === $id) ?? null,
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
