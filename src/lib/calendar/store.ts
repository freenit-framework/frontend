import { writable, derived, get } from 'svelte/store'
import { davRequest, parseMultiStatus, extractRelPath } from '$lib/dav'
import { parseICalEvents, serializeEvent } from './ical'
import type { Calendar, CalendarEvent } from './types'

export const calendars = writable<Calendar[]>([])
export const events = writable<CalendarEvent[]>([])
export const selectedEventId = writable<string | null>(null)
export const currentMonth = writable<Date>(new Date())
export const calendarLoading = writable(false)
export const calendarError = writable('')

export const selectedEvent = derived(
  [events, selectedEventId],
  ([$events, $id]) => $events.find((e) => e.uid === $id) ?? null,
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
  try {
    const cals = await fetchCalendars()
    calendars.set(cals)
    const year = new Date().getFullYear()
    await mergeYear(cals, year)
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

export async function deleteEvent(event: CalendarEvent) {
  const headers: Record<string, string> = {}
  if (event.etag) headers['If-Match'] = event.etag

  const { status } = await davRequest('DELETE', event.href, { headers })
  if (status >= 400) throw new Error(`Failed to delete event: HTTP ${status}`)

  events.update((es) => es.filter((e) => e.href !== event.href))
  selectedEventId.set(null)
}
