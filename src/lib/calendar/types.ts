export interface Calendar {
  name: string
  displayName: string
}

export interface CalendarEvent {
  uid: string
  href: string // API-relative path: /cal/{calendar}/{uid}.ics
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

export interface CalendarTask {
  uid: string
  href: string
  etag: string
  calendarName: string
  title: string
  due: Date | null
  allDay: boolean
  description: string
  location: string
  status: string // NEEDS-ACTION, IN-PROCESS, COMPLETED, CANCELLED
  priority: number // 0-9, where 1 is highest
  percentComplete: number
  completed: Date | null
}
