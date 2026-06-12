function unfold(raw: string): string {
  return raw.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '')
}

interface VCardProp {
  name: string
  params: Record<string, string>
  value: string
}

function parseLine(line: string): VCardProp {
  const colonIdx = line.indexOf(':')
  if (colonIdx === -1) return { name: line.toUpperCase(), params: {}, value: '' }

  const namePart = line.substring(0, colonIdx)
  const value = line.substring(colonIdx + 1)
  const parts = namePart.split(';')
  const name = parts[0].toUpperCase()
  const params: Record<string, string> = {}

  for (let i = 1; i < parts.length; i++) {
    const eq = parts[i].indexOf('=')
    if (eq !== -1) {
      params[parts[i].substring(0, eq).toUpperCase()] = parts[i].substring(eq + 1)
    }
  }

  return { name, params, value }
}

export interface ParsedVCard {
  uid: string
  displayName: string
  firstName: string
  lastName: string
  emails: string[]
  phones: string[]
  org: string
  note: string
}

export function parseVCard(raw: string): ParsedVCard {
  const lines = unfold(raw)
    .split(/\r\n|\n|\r/)
    .filter((l) => l.trim() && l !== 'BEGIN:VCARD' && l !== 'END:VCARD')

  const result: ParsedVCard = {
    uid: '',
    displayName: '',
    firstName: '',
    lastName: '',
    emails: [],
    phones: [],
    org: '',
    note: '',
  }

  for (const line of lines) {
    const { name, value } = parseLine(line)
    switch (name) {
      case 'UID':
        result.uid = value
        break
      case 'FN':
        result.displayName = value
        break
      case 'N': {
        const parts = value.split(';')
        result.lastName = parts[0] ?? ''
        result.firstName = parts[1] ?? ''
        break
      }
      case 'EMAIL':
        if (value) result.emails.push(value)
        break
      case 'TEL':
        if (value) result.phones.push(value)
        break
      case 'ORG':
        result.org = value.replace(/;/g, ' ').trim()
        break
      case 'NOTE':
        result.note = value.replace(/\\n/g, '\n').replace(/\\,/g, ',')
        break
    }
  }

  if (!result.displayName && (result.firstName || result.lastName)) {
    result.displayName = [result.firstName, result.lastName].filter(Boolean).join(' ')
  }

  return result
}

export function splitVCards(raw: string): string[] {
  const cards: string[] = []
  const lines = raw.split(/\r\n|\n|\r/)
  let current: string[] = []
  let inside = false

  for (const line of lines) {
    const upper = line.trim().toUpperCase()
    if (upper === 'BEGIN:VCARD') {
      inside = true
      current = []
    } else if (upper === 'END:VCARD') {
      if (inside) {
        cards.push(['BEGIN:VCARD', ...current, 'END:VCARD'].join('\r\n'))
      }
      inside = false
      current = []
    } else if (inside) {
      current.push(line)
    }
  }

  return cards
}

export function serializeVCard(contact: {
  uid: string
  displayName: string
  firstName?: string
  lastName?: string
  emails?: string[]
  phones?: string[]
  org?: string
  note?: string
}): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `UID:${contact.uid}`,
    `FN:${contact.displayName}`,
    `N:${contact.lastName ?? ''};${contact.firstName ?? ''};;;`,
  ]

  for (const email of contact.emails ?? []) {
    if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`)
  }
  for (const phone of contact.phones ?? []) {
    if (phone) lines.push(`TEL;TYPE=VOICE:${phone}`)
  }
  if (contact.org) lines.push(`ORG:${contact.org}`)
  if (contact.note) lines.push(`NOTE:${contact.note.replace(/\n/g, '\\n')}`)

  lines.push('END:VCARD')
  return lines.join('\r\n')
}
