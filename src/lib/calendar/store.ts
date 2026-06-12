import { writable, derived, get } from 'svelte/store'
import { davRequest, parseMultiStatus, extractRelPath } from '$lib/dav'
import {
  parseICalEvents,
  parseICalTasks,
  serializeEvent,
  serializeEvents,
  serializeTask,
  serializeTasks,
} from './ical'
import type { Calendar, CalendarEvent, CalendarTask } from './types'

export type CalendarView = 'day' | '3day' | 'week' | 'multiweek' | 'month'

export const calendars = writable<Calendar[]>([])
export const events = writable<CalendarEvent[]>([])
export const tasks = writable<CalendarTask[]>([])
export const selectedEventId = writable<string | null>(null)
export const selectedTaskId = writable<string | null>(null)
export const selectedCalendarName = writable<string>('')
export const currentMonth = writable<Date>(new Date())
export const calendarView = writable<CalendarView>('month')
export const calendarLoading = writable(false)
export const calendarError = writable('')

export const selectedEvent = derived(
  [events, selectedEventId],
  ([$events, $id]) => $events.find((e) => e.uid === $id) ?? null,
)

export const selectedTask = derived(
  [tasks, selectedTaskId],
  ([$tasks, $id]) => $tasks.find((t) => t.uid === $id) ?? null,
)

export const selectedCalendar = derived(
  [calendars, selectedCalendarName],
  ([$cals, $name]) => $cals.find((c) => c.name === $name) ?? null,
)

// Track which years we've already loaded so we don't re-fetch
const loadedYears = new Set<number>()

const LIST_BODY = `<?xml version="1.0" encoding="utf-8"?>
<D:propfind xmlns:D="DAV:">
  <D:prop>
    <D:resourcetype/>
    <D:displayname/>
  </D:prop>
</D:propfind>`

const MKCALENDAR_BODY = (displayName: string) => `<?xml version="1.0" encoding="utf-8"?>
<C:mkcalendar xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:set>
    <D:prop>
      <D:displayname>${escapeXml(displayName)}</D:displayname>
    </D:prop>
  </D:set>
</C:mkcalendar>`

const PROPPATCH_DISPLAYNAME_BODY = (displayName: string) => `<?xml version="1.0" encoding="utf-8"?>
<D:propertyupdate xmlns:D="DAV:">
  <D:set>
    <D:prop>
      <D:displayname>${escapeXml(displayName)}</D:displayname>
    </D:prop>
  </D:set>
</D:propertyupdate>`

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function makeEventQueryBody(year: number): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="${year}0101T000000Z" end="${year + 1}0101T000000Z"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`
}

const TASKS_BODY = `<?xml version="1.0" encoding="utf-8"?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VTODO"/>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`

async function fetchCalendars(): Promise<Calendar[]> {
  const { status, text } = await davRequest('PROPFIND', '/cal', { body: LIST_BODY, depth: '1' })
  if (status !== 207) return []

  return parseMultiStatus(text)
    .filter((r) => {
      const rel = extractRelPath(r.href, 'cal')
      return rel && rel.endsWith('/') && r.props['resourcetype']?.includes('calendar')
    })
    .map((r) => ({
      name: extractRelPath(r.href, 'cal').replace(/\/$/, ''),
      displayName: r.props['displayname'] || extractRelPath(r.href, 'cal').replace(/\/$/, ''),
    }))
}

async function fetchEventsForYear(cals: Calendar[], year: number): Promise<CalendarEvent[]> {
  const rangeStart = new Date(year, 0, 1)
  const rangeEnd = new Date(year + 1, 0, 1)
  const all: CalendarEvent[] = []

  for (const cal of cals) {
    const { status, text } = await davRequest('REPORT', `/cal/${cal.name}/`, {
      body: makeEventQueryBody(year),
      depth: '1',
    })
    if (status !== 207) continue

    for (const r of parseMultiStatus(text)) {
      const rel = extractRelPath(r.href, 'cal')
      if (!rel || !rel.endsWith('.ics')) continue
      const icalData = r.props['calendar-data']
      if (!icalData) continue

      try {
        const parsed = parseICalEvents(icalData, rangeStart, rangeEnd)
        for (const ev of parsed) {
          all.push({
            ...ev,
            href: `/cal/${rel}`,
            etag: r.props['getetag'] ?? '',
            calendarName: cal.name,
          })
        }
      } catch (e) {
        console.warn('iCal parse error:', e)
      }
    }
  }
  return all
}

async function fetchTasks(cals: Calendar[]): Promise<CalendarTask[]> {
  const all: CalendarTask[] = []
  for (const cal of cals) {
    const { status, text } = await davRequest('REPORT', `/cal/${cal.name}/`, {
      body: TASKS_BODY,
      depth: '1',
    })
    if (status !== 207) continue

    for (const r of parseMultiStatus(text)) {
      const rel = extractRelPath(r.href, 'cal')
      if (!rel || !rel.endsWith('.ics')) continue
      const icalData = r.props['calendar-data']
      if (!icalData) continue

      try {
        const parsed = parseICalTasks(icalData)
        for (const t of parsed) {
          all.push({
            ...t,
            href: `/cal/${rel}`,
            etag: r.props['getetag'] ?? '',
            calendarName: cal.name,
          })
        }
      } catch (e) {
        console.warn('Task parse error:', e)
      }
    }
  }
  return all.sort((a, b) => {
    if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1
    if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1
    if (a.due && b.due) return a.due.getTime() - b.due.getTime()
    if (a.due) return -1
    if (b.due) return 1
    return a.title.localeCompare(b.title)
  })
}

async function mergeYear(cals: Calendar[], year: number) {
  if (loadedYears.has(year)) return
  loadedYears.add(year)
  const yearEvents = await fetchEventsForYear(cals, year)
  events.update((existing) => {
    // Drop stale events for this year (e.g. after a save), then merge
    const others = existing.filter((e) => e.start.getFullYear() !== year)
    return [...others, ...yearEvents].sort((a, b) => a.start.getTime() - b.start.getTime())
  })
}

export async function initCalendar() {
  calendarLoading.set(true)
  calendarError.set('')
  loadedYears.clear()
  events.set([])
  tasks.set([])
  try {
    const cals = await fetchCalendars()
    calendars.set(cals)
    const year = new Date().getFullYear()
    await Promise.all([mergeYear(cals, year), fetchTasks(cals).then((t) => tasks.set(t))])
  } catch (e) {
    calendarError.set(e instanceof Error ? e.message : 'Failed to load calendar')
  } finally {
    calendarLoading.set(false)
  }
}

// Called from CalendarGrid when navigating months — loads adjacent year if needed
export async function ensureYearLoaded(year: number) {
  if (loadedYears.has(year)) return
  const cals = get(calendars)
  if (!cals.length) return
  calendarLoading.set(true)
  try {
    await mergeYear(cals, year)
  } catch (e) {
    console.warn('Failed to load year', year, e)
  } finally {
    calendarLoading.set(false)
  }
}

export function selectEvent(id: string | null) {
  selectedEventId.set(id)
}

export function selectTask(id: string | null) {
  selectedTaskId.set(id)
}

export function selectCalendar(name: string) {
  selectedCalendarName.set(name)
  selectedEventId.set(null)
  selectedTaskId.set(null)
}

export async function createCalendar(name: string, displayName: string): Promise<void> {
  const safeName =
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'calendar'

  const { status } = await davRequest('MKCALENDAR', `/cal/${safeName}/`, {
    body: MKCALENDAR_BODY(displayName),
  })
  if (status >= 400) throw new Error(`Failed to create calendar: HTTP ${status}`)
  await initCalendar()
  selectCalendar(safeName)
}

export async function deleteCalendar(calendar: Calendar): Promise<void> {
  const { status } = await davRequest('DELETE', `/cal/${calendar.name}/`)
  if (status >= 400) throw new Error(`Failed to delete calendar: HTTP ${status}`)
  if (get(selectedCalendarName) === calendar.name) {
    selectedCalendarName.set('')
  }
  await initCalendar()
}

export async function renameCalendar(calendar: Calendar, displayName: string): Promise<void> {
  const { status } = await davRequest('PROPPATCH', `/cal/${calendar.name}/`, {
    body: PROPPATCH_DISPLAYNAME_BODY(displayName),
  })
  if (status >= 400) throw new Error(`Failed to rename calendar: HTTP ${status}`)
  calendars.update((cals) =>
    cals.map((c) => (c.name === calendar.name ? { ...c, displayName } : c)),
  )
}

export async function saveEvent(event: CalendarEvent & { isNew?: boolean }) {
  const ical = serializeEvent(event)
  const headers: Record<string, string> = {}
  if (!event.isNew && event.etag) headers['If-Match'] = event.etag

  const { status } = await davRequest('PUT', event.href, {
    body: ical,
    contentType: 'text/calendar; charset=utf-8',
    headers,
  })
  if (status >= 400) throw new Error(`Failed to save event: HTTP ${status}`)

  // Invalidate the year so it reloads fresh with the new event
  loadedYears.delete(event.start.getFullYear())
  await initCalendar()
}

export interface ImportEventsResult {
  imported: number
  failed: number
}

export async function importEvents(
  file: File,
  calendarName: string,
  onProgress?: (current: number, total: number) => void,
): Promise<ImportEventsResult> {
  const text = await file.text()
  const now = new Date()
  const yearStart = new Date(now.getFullYear() - 1, 0, 1)
  const yearEnd = new Date(now.getFullYear() + 2, 0, 1)
  const parsedEvents = parseICalEvents(text, yearStart, yearEnd)
  const parsedTasks = parseICalTasks(text)

  if (parsedEvents.length === 0 && parsedTasks.length === 0) {
    throw new Error('No events or tasks found in file')
  }

  let imported = 0
  let failed = 0
  const allItems = [
    ...parsedEvents.map((ev) => ({ type: 'event' as const, data: ev })),
    ...parsedTasks.map((t) => ({ type: 'task' as const, data: t })),
  ]

  for (const [index, item] of allItems.entries()) {
    try {
      const uid = crypto.randomUUID()
      if (item.type === 'event') {
        const ev = item.data
        const ical = serializeEvent({
          uid,
          title: ev.title,
          start: ev.start,
          end: ev.end,
          allDay: ev.allDay,
          description: ev.description,
          location: ev.location,
          status: ev.status,
        })
        const { status } = await davRequest('PUT', `/cal/${calendarName}/${uid}.ics`, {
          body: ical,
          contentType: 'text/calendar; charset=utf-8',
        })
        if (status >= 400) failed++
        else imported++
      } else {
        const t = item.data
        const ical = serializeTask({
          uid,
          title: t.title,
          due: t.due,
          allDay: t.allDay,
          description: t.description,
          location: t.location,
          status: t.status,
          priority: t.priority,
          percentComplete: t.percentComplete,
          completed: t.completed,
        })
        const { status } = await davRequest('PUT', `/cal/${calendarName}/${uid}.ics`, {
          body: ical,
          contentType: 'text/calendar; charset=utf-8',
        })
        if (status >= 400) failed++
        else imported++
      }
    } catch (e) {
      console.warn('Import failed:', e)
      failed++
    } finally {
      onProgress?.(index + 1, allItems.length)
    }
  }

  if (imported > 0) {
    loadedYears.clear()
    events.set([])
    tasks.set([])
    await initCalendar()
  }
  return { imported, failed }
}

export function exportEvents(calendarName?: string): string {
  const list = get(events).filter(
    (e) => !calendarName || calendarName === '' || e.calendarName === calendarName,
  )
  if (list.length === 0) return ''
  return serializeEvents(list)
}

export function exportTasks(calendarName?: string): string {
  const list = get(tasks).filter(
    (t) => !calendarName || calendarName === '' || t.calendarName === calendarName,
  )
  if (list.length === 0) return ''
  return serializeTasks(list)
}

export function downloadICal(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function deleteEvent(event: CalendarEvent) {
  const headers: Record<string, string> = {}
  if (event.etag) headers['If-Match'] = event.etag

  const { status } = await davRequest('DELETE', event.href, { headers })
  if (status >= 400) throw new Error(`Failed to delete event: HTTP ${status}`)

  events.update((es) => es.filter((e) => e.href !== event.href))
  selectedEventId.set(null)
}

export async function clearCalendar(calendarName: string): Promise<void> {
  const eventsToDelete = get(events).filter((e) => e.calendarName === calendarName)
  const tasksToDelete = get(tasks).filter((t) => t.calendarName === calendarName)

  const results = await Promise.allSettled(
    [...eventsToDelete, ...tasksToDelete].map(async (item) => {
      const headers: Record<string, string> = {}
      if (item.etag) headers['If-Match'] = item.etag
      const { status } = await davRequest('DELETE', item.href, { headers })
      if (status >= 400) throw new Error(`Failed to delete item: HTTP ${status}`)
    }),
  )

  const failed = results.filter((r) => r.status === 'rejected').length
  if (failed > 0) throw new Error(`Failed to clear ${failed} item${failed === 1 ? '' : 's'}`)

  events.update((es) => es.filter((e) => e.calendarName !== calendarName))
  tasks.update((ts) => ts.filter((t) => t.calendarName !== calendarName))
  selectedEventId.set(null)
  selectedTaskId.set(null)
}

export async function saveTask(task: CalendarTask & { isNew?: boolean }) {
  const ical = serializeTask(task)
  const headers: Record<string, string> = {}
  if (!task.isNew && task.etag) headers['If-Match'] = task.etag

  const { status } = await davRequest('PUT', task.href, {
    body: ical,
    contentType: 'text/calendar; charset=utf-8',
    headers,
  })
  if (status >= 400) throw new Error(`Failed to save task: HTTP ${status}`)
  await initCalendar()
}

export async function deleteTask(task: CalendarTask) {
  const headers: Record<string, string> = {}
  if (task.etag) headers['If-Match'] = task.etag

  const { status } = await davRequest('DELETE', task.href, { headers })
  if (status >= 400) throw new Error(`Failed to delete task: HTTP ${status}`)

  tasks.update((ts) => ts.filter((t) => t.href !== task.href))
  selectedTaskId.set(null)
}

export async function toggleTaskComplete(task: CalendarTask) {
  const completed = task.status === 'COMPLETED'
  const updated: CalendarTask = {
    ...task,
    status: completed ? 'NEEDS-ACTION' : 'COMPLETED',
    percentComplete: completed ? 0 : 100,
    completed: completed ? null : new Date(),
  }
  await saveTask(updated)
}
