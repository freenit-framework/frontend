export interface Calendar {
  name: string
  displayName: string
}

export interface CalendarEvent {
  uid: string
  href: string       // API-relative path: /cal/{calendar}/{uid}.ics
  etag: string
  calendarName: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  description: string
  location: string
  status: string
}
