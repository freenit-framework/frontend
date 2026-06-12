function unfold(raw: string): string {
  return raw.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '')
}

interface ICalProp {
  name: string
  params: Record<string, string>
  value: string
}

function parseLine(line: string): ICalProp {
  const colonIdx = line.indexOf(':')
  if (colonIdx === -1) return { name: line.toUpperCase(), params: {}, value: '' }

  const namePart = line.substring(0, colonIdx)
  const value = line.substring(colonIdx + 1)
  const parts = namePart.split(';')
  const name = parts[0].toUpperCase()
  const params: Record<string, string> = {}

  for (let i = 1; i < parts.length; i++) {
    const eq = parts[i].indexOf('=')
    if (eq !== -1) params[parts[i].substring(0, eq).toUpperCase()] = parts[i].substring(eq + 1)
  }

  return { name, params, value }
}

function parseDateTime(value: string, params: Record<string, string>): { date: Date; allDay: boolean } {
  if (params['VALUE'] === 'DATE' || /^\d{8}$/.test(value)) {
    const y = parseInt(value.slice(0, 4))
    const m = parseInt(value.slice(4, 6)) - 1
    const d = parseInt(value.slice(6, 8))
    return { date: new Date(y, m, d), allDay: true }
  }
  if (/^\d{8}T\d{6}Z?$/.test(value)) {
    const y = parseInt(value.slice(0, 4))
    const mo = parseInt(value.slice(4, 6)) - 1
    const d = parseInt(value.slice(6, 8))
    const h = parseInt(value.slice(9, 11))
    const mi = parseInt(value.slice(11, 13))
    const s = parseInt(value.slice(13, 15))
    const date = value.endsWith('Z')
      ? new Date(Date.UTC(y, mo, d, h, mi, s))
      : new Date(y, mo, d, h, mi, s)
    return { date, allDay: false }
  }
  return { date: new Date(), allDay: false }
}

function parseDuration(value: string): number {
  const m = value.match(/P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/)
  if (!m) return 0
  return (parseInt(m[1] ?? '0') * 7 * 86400
        + parseInt(m[2] ?? '0') * 86400
        + parseInt(m[3] ?? '0') * 3600
        + parseInt(m[4] ?? '0') * 60
        + parseInt(m[5] ?? '0')) * 1000
}

function decodeText(value: string): string {
  return value
    .replace(/\\n/g, '\n').replace(/\\N/g, '\n')
    .replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\')
}

function encodeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\').replace(/\n/g, '\\n')
    .replace(/,/g, '\\,').replace(/;/g, '\\;')
}

// RRULE

interface RRule {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  interval: number
  count?: number
  until?: Date
  byday?: number[]   // 0=Sun … 6=Sat
  bymonthday?: number[]
}

const BYDAY_MAP: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
}

function parseRRule(value: string): RRule | null {
  const parts = Object.fromEntries(
    value.split(';').map((p) => { const i = p.indexOf('='); return [p.slice(0, i), p.slice(i + 1)] })
  )
  const freq = parts['FREQ'] as RRule['freq']
  if (!['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(freq)) return null

  const rule: RRule = { freq, interval: parseInt(parts['INTERVAL'] ?? '1', 10) }
  if (parts['COUNT']) rule.count = parseInt(parts['COUNT'], 10)
  if (parts['UNTIL']) rule.until = parseDateTime(parts['UNTIL'], {}).date
  if (parts['BYDAY']) rule.byday = parts['BYDAY'].split(',').map((d) => BYDAY_MAP[d.slice(-2)] ?? 0)
  if (parts['BYMONTHDAY']) rule.bymonthday = parts['BYMONTHDAY'].split(',').map(Number)
  return rule
}

function advancePeriod(d: Date, rule: RRule) {
  switch (rule.freq) {
    case 'DAILY': d.setDate(d.getDate() + rule.interval); break
    case 'WEEKLY': d.setDate(d.getDate() + 7 * rule.interval); break
    case 'MONTHLY': d.setMonth(d.getMonth() + rule.interval); break
    case 'YEARLY': d.setFullYear(d.getFullYear() + rule.interval); break
  }
}

function candidatesForPeriod(periodStart: Date, dtstart: Date, rule: RRule): Date[] {
  if (rule.freq === 'WEEKLY' && rule.byday && rule.byday.length > 0) {
    // Sunday of the week containing periodStart
    const sunday = new Date(periodStart)
    sunday.setDate(periodStart.getDate() - periodStart.getDay())
    return rule.byday
      .map((num) => {
        const d = new Date(sunday)
        d.setDate(sunday.getDate() + num)
        d.setHours(dtstart.getHours(), dtstart.getMinutes(), dtstart.getSeconds(), 0)
        return d
      })
      .sort((a, b) => a.getTime() - b.getTime())
  }
  return [new Date(periodStart)]
}

export interface ParsedEvent {
  uid: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  description: string
  location: string
  status: string
}

interface RawEvent {
  uid: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  description: string
  location: string
  status: string
  rrule?: RRule
  exdates: Set<string>
}

function expandRecurring(ev: RawEvent, rangeStart: Date, rangeEnd: Date): ParsedEvent[] {
  if (!ev.rrule) {
    return [{ uid: ev.uid, title: ev.title, start: ev.start, end: ev.end,
              allDay: ev.allDay, description: ev.description, location: ev.location, status: ev.status }]
  }

  const rule = ev.rrule
  const duration = ev.end.getTime() - ev.start.getTime()
  const results: ParsedEvent[] = []
  let occurrenceCount = 0
  const current = new Date(ev.start)
  const HARD_LIMIT = 2000

  while (results.length < HARD_LIMIT) {
    if (rule.count !== undefined && occurrenceCount >= rule.count) break
    if (rule.until && current > rule.until) break
    if (current > rangeEnd) break

    const candidates = candidatesForPeriod(current, ev.start, rule)

    for (const cand of candidates) {
      if (rule.count !== undefined && occurrenceCount >= rule.count) break
      if (rule.until && cand > rule.until) break
      if (cand < ev.start) continue
      if (cand > rangeEnd) break

      occurrenceCount++

      const dateKey = `${cand.getFullYear()}${String(cand.getMonth() + 1).padStart(2,'0')}${String(cand.getDate()).padStart(2,'0')}`
      if (ev.exdates.has(dateKey)) continue
      if (cand < rangeStart) continue

      results.push({
        uid: `${ev.uid}_${cand.getTime()}`,
        title: ev.title,
        start: cand,
        end: new Date(cand.getTime() + duration),
        allDay: ev.allDay,
        description: ev.description,
        location: ev.location,
        status: ev.status,
      })
    }

    advancePeriod(current, rule)
  }

  return results
}

export function parseICalEvents(raw: string, rangeStart?: Date, rangeEnd?: Date): ParsedEvent[] {
  const lines = unfold(raw).split(/\r\n|\n|\r/)
  const rawEvents: RawEvent[] = []

  let inEvent = false
  let uid = '', title = '', startRaw = '', endRaw = '', durationRaw = ''
  let startParams: Record<string, string> = {}, endParams: Record<string, string> = {}
  let description = '', location = '', status = 'CONFIRMED'
  let rruleRaw = ''
  const exdates: Set<string> = new Set()

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      uid = title = startRaw = endRaw = durationRaw = description = location = rruleRaw = ''
      startParams = {}; endParams = {}
      status = 'CONFIRMED'
      exdates.clear()
      continue
    }
    if (line === 'END:VEVENT') {
      inEvent = false
      if (uid && startRaw) {
        const { date: start, allDay } = parseDateTime(startRaw, startParams)
        let end: Date
        if (endRaw) end = parseDateTime(endRaw, endParams).date
        else if (durationRaw) end = new Date(start.getTime() + parseDuration(durationRaw))
        else end = new Date(start.getTime() + (allDay ? 86400000 : 3600000))

        rawEvents.push({
          uid, title: title || '(No title)', start, end, allDay,
          description, location, status,
          rrule: rruleRaw ? parseRRule(rruleRaw) ?? undefined : undefined,
          exdates: new Set(exdates),
        })
      }
      continue
    }
    if (!inEvent) continue

    const { name, params, value } = parseLine(line)
    switch (name) {
      case 'UID': uid = value; break
      case 'SUMMARY': title = decodeText(value); break
      case 'DTSTART': startRaw = value; startParams = params; break
      case 'DTEND': endRaw = value; endParams = params; break
      case 'DURATION': durationRaw = value; break
      case 'DESCRIPTION': description = decodeText(value); break
      case 'LOCATION': location = decodeText(value); break
      case 'STATUS': status = value; break
      case 'RRULE': rruleRaw = value; break
      case 'EXDATE':
        // value may be comma-separated list of dates
        for (const d of value.split(',')) {
          const { date } = parseDateTime(d.trim(), params)
          exdates.add(`${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`)
        }
        break
    }
  }

  if (!rangeStart || !rangeEnd) {
    // No range: return base occurrences only
    return rawEvents.map((ev) => ({
      uid: ev.uid, title: ev.title, start: ev.start, end: ev.end,
      allDay: ev.allDay, description: ev.description, location: ev.location, status: ev.status,
    }))
  }

  return rawEvents.flatMap((ev) => expandRecurring(ev, rangeStart, rangeEnd))
}

export interface ParsedTask {
  uid: string
  title: string
  due: Date | null
  allDay: boolean
  description: string
  location: string
  status: string
  priority: number
  percentComplete: number
  completed: Date | null
}

export function parseICalTasks(raw: string): ParsedTask[] {
  const lines = unfold(raw).split(/\r\n|\n|\r/)
  const tasks: ParsedTask[] = []

  let inTodo = false
  let uid = '', title = '', dueRaw = '', completedRaw = ''
  let dueParams: Record<string, string> = {}
  let description = '', location = '', status = 'NEEDS-ACTION'
  let priority = 0, percentComplete = 0

  for (const line of lines) {
    if (line === 'BEGIN:VTODO') {
      inTodo = true
      uid = title = dueRaw = completedRaw = description = location = ''
      dueParams = {}
      status = 'NEEDS-ACTION'
      priority = 0
      percentComplete = 0
      continue
    }
    if (line === 'END:VTODO') {
      inTodo = false
      if (uid) {
        let due: Date | null = null
        let allDay = false
        if (dueRaw) {
          const parsed = parseDateTime(dueRaw, dueParams)
          due = parsed.date
          allDay = parsed.allDay
        }
        let completed: Date | null = null
        if (completedRaw) {
          completed = parseDateTime(completedRaw, {}).date
        }
        tasks.push({
          uid,
          title: title || '(No title)',
          due,
          allDay,
          description,
          location,
          status,
          priority,
          percentComplete,
          completed,
        })
      }
      continue
    }
    if (!inTodo) continue

    const { name, params, value } = parseLine(line)
    switch (name) {
      case 'UID': uid = value; break
      case 'SUMMARY': title = decodeText(value); break
      case 'DUE': dueRaw = value; dueParams = params; break
      case 'COMPLETED': completedRaw = value; break
      case 'DESCRIPTION': description = decodeText(value); break
      case 'LOCATION': location = decodeText(value); break
      case 'STATUS': status = value; break
      case 'PRIORITY': priority = parseInt(value, 10) || 0; break
      case 'PERCENT-COMPLETE': percentComplete = parseInt(value, 10) || 0; break
    }
  }

  return tasks
}

function pad2(n: number): string { return String(n).padStart(2, '0') }

function formatDateUTC(d: Date): string {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth()+1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`
}

function formatDateLocal(d: Date): string {
  return `${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}`
}

export function serializeEvent(event: {
  uid: string; title: string; start: Date; end: Date
  allDay: boolean; description?: string; location?: string
  status?: string
}): string {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//freenit//EN',
    'BEGIN:VEVENT', `UID:${event.uid}`, `SUMMARY:${encodeText(event.title)}`,
  ]
  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatDateLocal(event.start)}`)
    lines.push(`DTEND;VALUE=DATE:${formatDateLocal(event.end)}`)
  } else {
    lines.push(`DTSTART:${formatDateUTC(event.start)}`)
    lines.push(`DTEND:${formatDateUTC(event.end)}`)
  }
  if (event.description) lines.push(`DESCRIPTION:${encodeText(event.description)}`)
  if (event.location) lines.push(`LOCATION:${encodeText(event.location)}`)
  if (event.status) lines.push(`STATUS:${event.status}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}

export function serializeEvents(events: { uid: string; title: string; start: Date; end: Date; allDay: boolean; description?: string; location?: string; status?: string }[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//freenit//EN']
  for (const event of events) {
    lines.push('BEGIN:VEVENT', `UID:${event.uid}`, `SUMMARY:${encodeText(event.title)}`)
    if (event.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${formatDateLocal(event.start)}`)
      lines.push(`DTEND;VALUE=DATE:${formatDateLocal(event.end)}`)
    } else {
      lines.push(`DTSTART:${formatDateUTC(event.start)}`)
      lines.push(`DTEND:${formatDateUTC(event.end)}`)
    }
    if (event.description) lines.push(`DESCRIPTION:${encodeText(event.description)}`)
    if (event.location) lines.push(`LOCATION:${encodeText(event.location)}`)
    if (event.status) lines.push(`STATUS:${event.status}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

function serializeTaskLines(task: {
  uid: string
  title: string
  due: Date | null
  allDay: boolean
  description?: string
  location?: string
  status?: string
  priority?: number
  percentComplete?: number
  completed?: Date | null
}): string[] {
  const lines = [
    'BEGIN:VTODO', `UID:${task.uid}`, `SUMMARY:${encodeText(task.title)}`,
  ]
  if (task.due) {
    if (task.allDay) {
      lines.push(`DUE;VALUE=DATE:${formatDateLocal(task.due)}`)
    } else {
      lines.push(`DUE:${formatDateUTC(task.due)}`)
    }
  }
  if (task.description) lines.push(`DESCRIPTION:${encodeText(task.description)}`)
  if (task.location) lines.push(`LOCATION:${encodeText(task.location)}`)
  if (task.status) lines.push(`STATUS:${task.status}`)
  if (task.priority) lines.push(`PRIORITY:${task.priority}`)
  if (task.percentComplete) lines.push(`PERCENT-COMPLETE:${task.percentComplete}`)
  if (task.completed) lines.push(`COMPLETED:${formatDateUTC(task.completed)}`)
  lines.push('END:VTODO')
  return lines
}

export function serializeTask(task: {
  uid: string
  title: string
  due: Date | null
  allDay: boolean
  description?: string
  location?: string
  status?: string
  priority?: number
  percentComplete?: number
  completed?: Date | null
}): string {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//freenit//EN', ...serializeTaskLines(task), 'END:VCALENDAR'].join('\r\n')
}

export function serializeTasks(tasks: {
  uid: string
  title: string
  due: Date | null
  allDay: boolean
  description?: string
  location?: string
  status?: string
  priority?: number
  percentComplete?: number
  completed?: Date | null
}[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//freenit//EN']
  for (const task of tasks) {
    lines.push(...serializeTaskLines(task))
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function localInputToDate(value: string): Date { return new Date(value) }

export function dateToLocalInput(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function dateToDateInput(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`
}
