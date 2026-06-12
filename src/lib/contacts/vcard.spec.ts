import { describe, it, expect } from 'vitest'
import { parseVCard, serializeVCard, splitVCards } from './vcard'

const sampleVCard = `BEGIN:VCARD
VERSION:3.0
UID:test-uid
FN:John Doe
N:Doe;John;;;
EMAIL;TYPE=INTERNET:john@example.com
TEL;TYPE=VOICE:+1234567890
ORG:Example Inc.
NOTE:Note line 1\\nNote line 2
END:VCARD`

const multiVCard = `BEGIN:VCARD
VERSION:3.0
UID:first
FN:Alice
N:;Alice;;;
EMAIL:alice@example.com
END:VCARD
BEGIN:VCARD
VERSION:3.0
UID:second
FN:Bob
N:;Bob;;;
EMAIL:bob@example.com
END:VCARD`

describe('parseVCard', () => {
  it('parses a single vCard', () => {
    const parsed = parseVCard(sampleVCard)
    expect(parsed.uid).toBe('test-uid')
    expect(parsed.displayName).toBe('John Doe')
    expect(parsed.firstName).toBe('John')
    expect(parsed.lastName).toBe('Doe')
    expect(parsed.emails).toEqual(['john@example.com'])
    expect(parsed.phones).toEqual(['+1234567890'])
    expect(parsed.org).toBe('Example Inc.')
    expect(parsed.note).toBe('Note line 1\nNote line 2')
  })

  it('derives display name from first/last name', () => {
    const parsed = parseVCard(`BEGIN:VCARD\nVERSION:3.0\nN:Doe;Jane;;;\nEND:VCARD`)
    expect(parsed.displayName).toBe('Jane Doe')
  })
})

describe('serializeVCard', () => {
  it('round-trips essential fields', () => {
    const parsed = parseVCard(sampleVCard)
    const serialized = serializeVCard(parsed)
    const reparsed = parseVCard(serialized)
    expect(reparsed.uid).toBe(parsed.uid)
    expect(reparsed.displayName).toBe(parsed.displayName)
    expect(reparsed.emails).toEqual(parsed.emails)
  })
})

describe('splitVCards', () => {
  it('splits multiple vCards', () => {
    const cards = splitVCards(multiVCard)
    expect(cards).toHaveLength(2)
    expect(cards[0]).toContain('Alice')
    expect(cards[1]).toContain('Bob')
  })

  it('returns empty array for invalid content', () => {
    expect(splitVCards('not a vcard')).toHaveLength(0)
  })
})
