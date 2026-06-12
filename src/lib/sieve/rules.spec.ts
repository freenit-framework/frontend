import { describe, it, expect } from 'vitest'
import { generateSieve, parseSieve } from './rules'
import type { SieveRule } from './rules'

function sampleRules(): SieveRule[] {
  return [
    {
      id: '1',
      name: 'Spam',
      all: false,
      conditions: [{ field: 'x-spam-flag', op: 'is', value: 'YES' }],
      action: { type: 'fileinto', folder: 'Junk' },
      stop: true,
    },
    {
      id: '2',
      name: 'List',
      all: true,
      conditions: [
        { field: 'from', op: 'contains', value: '@lists.example.com' },
        { field: 'subject', op: 'contains', value: '[announce]' },
      ],
      action: { type: 'fileinto', folder: 'Lists' },
      stop: false,
    },
    {
      id: '3',
      name: 'Vacation',
      all: false,
      conditions: [{ field: 'to', op: 'is', value: 'me@example.com' }],
      action: { type: 'vacation', message: 'I am away', days: 7, subject: 'Out of office' },
      stop: false,
    },
  ]
}

describe('generateSieve', () => {
  it('generates a valid sieve script from rules', () => {
    const script = generateSieve(sampleRules())
    expect(script).toContain('require ["fileinto", "vacation"];')
    expect(script).toContain('if header :is "x-spam-flag" "YES" {')
    expect(script).toContain('fileinto "Junk";')
    expect(script).toContain('stop;')
    expect(script).toContain(
      'if allof(header :contains "from" "@lists.example.com", header :contains "subject" "[announce]") {',
    )
    expect(script).toContain('vacation :days 7 :subject "Out of office" "I am away";')
  })

  it('returns empty string for no rules', () => {
    expect(generateSieve([])).toBe('')
  })

  it('escapes quotes and backslashes', () => {
    const script = generateSieve([
      {
        id: '1',
        name: '',
        all: false,
        conditions: [{ field: 'subject', op: 'contains', value: 'say "hello"' }],
        action: { type: 'discard' },
        stop: false,
      },
    ])
    expect(script).toContain('header :contains "subject" "say \\"hello\\""')
  })
})

describe('parseSieve', () => {
  it('round-trips generated rules', () => {
    const original = sampleRules()
    const script = generateSieve(original)
    const { rules, partial } = parseSieve(script)
    expect(partial).toBe(false)
    expect(rules).toHaveLength(3)
    expect(rules[0].action).toEqual({ type: 'fileinto', folder: 'Junk' })
    expect(rules[0].stop).toBe(true)
    expect(rules[1].all).toBe(true)
    expect(rules[1].conditions).toHaveLength(2)
    expect(rules[2].action.type).toBe('vacation')
    expect(rules[2].action.message).toBe('I am away')
    expect(rules[2].action.subject).toBe('Out of office')
    expect(rules[2].action.days).toBe(7)
  })

  it('parses a simple fileinto rule', () => {
    const script = `require ["fileinto"];

if header :contains "from" "boss@example.com" {
    fileinto "Work";
}
`
    const { rules, partial } = parseSieve(script)
    expect(partial).toBe(false)
    expect(rules).toHaveLength(1)
    expect(rules[0].conditions[0]).toEqual({
      field: 'from',
      op: 'contains',
      value: 'boss@example.com',
    })
    expect(rules[0].action).toEqual({ type: 'fileinto', folder: 'Work' })
  })

  it('marks unsupported syntax as partial', () => {
    const script = `require ["fileinto"];

if envelope :from "foo@bar.com" {
    fileinto "Foo";
}
`
    const { partial } = parseSieve(script)
    expect(partial).toBe(true)
  })
})
