export interface SieveCondition {
  field: 'from' | 'to' | 'subject' | 'cc' | 'list-id' | 'x-spam-flag' | 'x-priority'
  op: 'contains' | 'is' | 'matches'
  value: string
}

export interface SieveRule {
  id: string
  name: string
  all: boolean
  conditions: SieveCondition[]
  action: SieveAction
  stop: boolean
}

export interface SieveAction {
  type: 'keep' | 'discard' | 'fileinto' | 'redirect' | 'vacation' | 'mark-read'
  folder?: string
  address?: string
  message?: string
  days?: number
  subject?: string
}

export const conditionFields: { value: SieveCondition['field']; label: string }[] = [
  { value: 'from', label: 'From' },
  { value: 'to', label: 'To' },
  { value: 'subject', label: 'Subject' },
  { value: 'cc', label: 'CC' },
  { value: 'list-id', label: 'List-ID' },
  { value: 'x-spam-flag', label: 'Spam flag' },
  { value: 'x-priority', label: 'Priority' },
]

export const conditionOps: { value: SieveCondition['op']; label: string }[] = [
  { value: 'contains', label: 'contains' },
  { value: 'is', label: 'is' },
  { value: 'matches', label: 'matches' },
]

export const actionTypes: { value: SieveAction['type']; label: string }[] = [
  { value: 'keep', label: 'Keep in inbox' },
  { value: 'discard', label: 'Discard' },
  { value: 'fileinto', label: 'Move to folder' },
  { value: 'redirect', label: 'Forward to' },
  { value: 'vacation', label: 'Vacation reply' },
  { value: 'mark-read', label: 'Mark as read' },
]

function sieveStr(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
}

function emptyRule(): SieveRule {
  return {
    id: Math.random().toString(36).slice(2),
    name: '',
    all: false,
    conditions: [{ field: 'from', op: 'contains', value: '' }],
    action: { type: 'fileinto', folder: '' },
    stop: false,
  }
}

export function newRule(): SieveRule {
  return emptyRule()
}

export function generateSieve(rules: SieveRule[]): string {
  const requires = new Set<string>()
  const body: string[] = []

  for (const rule of rules) {
    if (rule.conditions.length === 0) continue

    const conditions = rule.conditions
      .map((c) => {
        const match = c.op === 'is' ? ':is' : c.op === 'contains' ? ':contains' : ':matches'
        return `header ${match} ${sieveStr(c.field)} ${sieveStr(c.value)}`
      })
      .join(', ')

    const test =
      rule.conditions.length === 1
        ? conditions
        : rule.all
          ? `allof(${conditions})`
          : `anyof(${conditions})`

    const lines: string[] = []
    switch (rule.action.type) {
      case 'keep':
        lines.push('keep;')
        break
      case 'discard':
        lines.push('discard;')
        break
      case 'fileinto':
        requires.add('fileinto')
        lines.push(`fileinto ${sieveStr(rule.action.folder || '')};`)
        break
      case 'redirect':
        lines.push(`redirect ${sieveStr(rule.action.address || '')};`)
        break
      case 'vacation':
        requires.add('vacation')
        if (rule.action.subject) {
          lines.push(
            `vacation :days ${rule.action.days || 7} :subject ${sieveStr(rule.action.subject)} ${sieveStr(rule.action.message || '')};`,
          )
        } else {
          lines.push(
            `vacation :days ${rule.action.days || 7} ${sieveStr(rule.action.message || '')};`,
          )
        }
        break
      case 'mark-read':
        requires.add('imap4flags')
        lines.push('addflag "\\\\Seen";')
        break
    }

    if (rule.stop) {
      lines.push('stop;')
    }

    if (lines.length > 0) {
      body.push(`if ${test} {`)
      for (const line of lines) {
        body.push(`    ${line}`)
      }
      body.push('}')
    }
  }

  if (body.length === 0) {
    return ''
  }

  const header = `require [${Array.from(requires)
    .sort()
    .map((r) => `"${r}"`)
    .join(', ')}];`
  return `${header}\n\n${body.join('\n')}\n`
}

function parseString(text: string): { value: string; rest: string } | null {
  const trimmed = text.trim()
  if (!trimmed.startsWith('"')) return null
  let value = ''
  let i = 1
  let escaped = false
  while (i < trimmed.length) {
    const ch = trimmed[i]
    if (escaped) {
      value += ch === 'n' ? '\n' : ch
      escaped = false
    } else if (ch === '\\') {
      escaped = true
    } else if (ch === '"') {
      return { value, rest: trimmed.slice(i + 1) }
    } else {
      value += ch
    }
    i++
  }
  return null
}

function parseHeaderTest(text: string): SieveCondition | null {
  const rest = text.trim()
  const match = rest.match(/^header\s+(:is|:contains|:matches)\s+(.*)$/is)
  if (!match) return null
  const op: SieveCondition['op'] =
    match[1] === ':is' ? 'is' : match[1] === ':contains' ? 'contains' : 'matches'
  const parsedField = parseString(match[2])
  if (!parsedField) return null
  const parsedValue = parseString(parsedField.rest)
  if (!parsedValue) return null
  const field = parsedField.value as SieveCondition['field']
  if (!conditionFields.some((f) => f.value === field)) return null
  return { field, op, value: parsedValue.value }
}

function parseAction(line: string): { action: SieveAction; stop: boolean } | null {
  const trimmed = line.trim().replace(/;$/, '')
  if (trimmed === 'keep') return { action: { type: 'keep' }, stop: false }
  if (trimmed === 'discard') return { action: { type: 'discard' }, stop: false }
  if (trimmed === 'stop') return { action: { type: 'keep' }, stop: true }

  let m = trimmed.match(/^fileinto\s+(.*)$/i)
  if (m) {
    const parsed = parseString(m[1])
    if (parsed) return { action: { type: 'fileinto', folder: parsed.value }, stop: false }
  }

  m = trimmed.match(/^redirect\s+(.*)$/i)
  if (m) {
    const parsed = parseString(m[1])
    if (parsed) return { action: { type: 'redirect', address: parsed.value }, stop: false }
  }

  m = trimmed.match(/^addflag\s+"\\\\Seen"$/i)
  if (m) return { action: { type: 'mark-read' }, stop: false }

  m = trimmed.match(/^vacation\s+:days\s+(\d+)\s+(?::subject\s+"((?:[^"\\]|\\.)*)")?\s*(.*)$/is)
  if (m) {
    const days = parseInt(m[1], 10)
    let subject = ''
    let message: string
    if (m[2] && m[3]) {
      subject = m[2].replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      const msgParsed = parseString(m[3])
      message = msgParsed?.value ?? ''
    } else {
      const msgParsed = parseString(m[2])
      message = msgParsed?.value ?? ''
    }
    return { action: { type: 'vacation', message, days, subject }, stop: false }
  }

  return null
}

function parseIfBlock(lines: string[], start: number): { rule: SieveRule; end: number } | null {
  const first = lines[start].trim()
  const m = first.match(/^if\s+(.*)\s*\{\s*$/i)
  if (!m) return null

  const testStr = m[1].trim()
  let all = false
  let conditionStrs: string[]

  const allofMatch = testStr.match(/^allof\s*\((.*)\)$/is)
  const anyofMatch = testStr.match(/^anyof\s*\((.*)\)$/is)
  if (allofMatch) {
    all = true
    conditionStrs = splitConditions(allofMatch[1])
  } else if (anyofMatch) {
    all = false
    conditionStrs = splitConditions(anyofMatch[1])
  } else {
    conditionStrs = [testStr]
  }

  const conditions: SieveCondition[] = []
  for (const s of conditionStrs) {
    const cond = parseHeaderTest(s)
    if (cond) conditions.push(cond)
  }

  if (conditions.length === 0) return null

  const actionLines: string[] = []
  let i = start + 1
  while (i < lines.length) {
    const line = lines[i].trim()
    if (line === '}') {
      i++
      break
    }
    if (line && !line.startsWith('#')) {
      actionLines.push(line)
    }
    i++
  }

  let action: SieveAction = { type: 'keep' }
  let stop = false
  for (const line of actionLines) {
    const parsed = parseAction(line)
    if (!parsed) return null
    if (parsed.stop) {
      stop = true
    } else {
      action = parsed.action
    }
  }

  return {
    rule: {
      id: Math.random().toString(36).slice(2),
      name: '',
      all,
      conditions,
      action,
      stop,
    },
    end: i,
  }
}

function splitConditions(text: string): string[] {
  const parts: string[] = []
  let current = ''
  let depth = 0
  let inString = false
  let escaped = false
  for (const ch of text) {
    if (escaped) {
      current += ch
      escaped = false
      continue
    }
    if (ch === '\\') {
      current += ch
      escaped = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      current += ch
      continue
    }
    if (!inString) {
      if (ch === '(') depth++
      if (ch === ')') depth--
      if (ch === ',' && depth === 0) {
        parts.push(current.trim())
        current = ''
        continue
      }
    }
    current += ch
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

export function parseSieve(script: string): { rules: SieveRule[]; partial: boolean } {
  const rules: SieveRule[] = []
  const lines = script.split('\n').map((l) => l.trimEnd())
  let i = 0
  let partial = false

  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line || line.startsWith('#') || line.startsWith('require')) {
      i++
      continue
    }
    if (line.startsWith('if ')) {
      const block = parseIfBlock(lines, i)
      if (block) {
        rules.push(block.rule)
        i = block.end
      } else {
        partial = true
        i++
      }
    } else {
      partial = true
      i++
    }
  }

  return { rules, partial }
}
