<script lang="ts">
  import {
    events,
    currentMonth,
    calendarView,
    selectEvent,
    selectedEventId,
    selectedCalendarName,
    ensureYearLoaded,
  } from '$lib/calendar/store'
  import type { CalendarEvent } from '$lib/calendar/types'

  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }

  function addDays(d: Date, n: number): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
  }

  function addWeeks(d: Date, n: number): Date {
    return addDays(d, n * 7)
  }

  function addMonths(d: Date, n: number): Date {
    return new Date(d.getFullYear(), d.getMonth() + n, 1)
  }

  function startOfWeek(d: Date): Date {
    const day = d.getDay()
    const offset = (day + 6) % 7
    return addDays(startOfDay(d), -offset)
  }

  function daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate()
  }

  function firstDayOffset(year: number, month: number): number {
    const day = new Date(year, month, 1).getDay()
    return (day + 6) % 7
  }

  function eventsOnDay(date: Date): CalendarEvent[] {
    const dayStart = startOfDay(date)
    const dayEnd = addDays(dayStart, 1)
    return $events.filter(
      (e) =>
        ($selectedCalendarName === '' || e.calendarName === $selectedCalendarName) &&
        e.start < dayEnd &&
        e.end > dayStart,
    )
  }

  function eventStyle(ev: CalendarEvent, dayStart: Date): { top: string; height: string } {
    const minutesPerDay = 1440
    const startMinutes = Math.max(0, (ev.start.getTime() - dayStart.getTime()) / 60000)
    const endMinutes = Math.min(minutesPerDay, (ev.end.getTime() - dayStart.getTime()) / 60000)
    const top = (startMinutes / minutesPerDay) * 100
    const height = ((endMinutes - startMinutes) / minutesPerDay) * 100
    return { top: `${top}%`, height: `${Math.max(height, 2)}%` }
  }

  const view = $derived($calendarView)
  const anchor = $derived($currentMonth)

  const viewDates = $derived((() => {
    const start = startOfWeek(anchor)
    switch (view) {
      case 'day': return [startOfDay(anchor)]
      case '3day': return Array.from({ length: 3 }, (_, i) => addDays(startOfDay(anchor), i))
      case 'week': return Array.from({ length: 7 }, (_, i) => addDays(start, i))
      case 'multiweek': return Array.from({ length: 28 }, (_, i) => addDays(start, i))
      case 'month': {
        const year = anchor.getFullYear()
        const month = anchor.getMonth()
        const offset = firstDayOffset(year, month)
        const days = daysInMonth(year, month)
        const total = Math.ceil((offset + days) / 7) * 7
        return Array.from({ length: total }, (_, i) => {
          const dayNum = i - offset + 1
          if (dayNum < 1 || dayNum > days) return null
          return new Date(year, month, dayNum)
        })
      }
    }
  })())

  const title = $derived((() => {
    if (view === 'day') {
      return anchor.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    }
    if (view === '3day') {
      const end = addDays(anchor, 2)
      return `${anchor.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    if (view === 'week') {
      const end = addDays(startOfWeek(anchor), 6)
      return `${startOfWeek(anchor).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    if (view === 'multiweek') {
      const start = startOfWeek(anchor)
      const end = addDays(start, 27)
      return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    return `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`
  })())

  const today = new Date()

  async function prev() {
    let next = anchor
    switch (view) {
      case 'day': next = addDays(anchor, -1); break
      case '3day': next = addDays(anchor, -3); break
      case 'week': next = addWeeks(anchor, -1); break
      case 'multiweek': next = addWeeks(anchor, -1); break
      case 'month': next = addMonths(anchor, -1); break
    }
    currentMonth.set(next)
    await ensureYearLoaded(next.getFullYear())
  }

  async function next() {
    let n = anchor
    switch (view) {
      case 'day': n = addDays(anchor, 1); break
      case '3day': n = addDays(anchor, 3); break
      case 'week': n = addWeeks(anchor, 1); break
      case 'multiweek': n = addWeeks(anchor, 1); break
      case 'month': n = addMonths(anchor, 1); break
    }
    currentMonth.set(n)
    await ensureYearLoaded(n.getFullYear())
  }

  function goToday() {
    currentMonth.set(new Date())
  }

  function setView(v: typeof view) {
    calendarView.set(v)
  }

  function formatHour(h: number): string {
    return h === 0 ? 'Midnight' : h === 12 ? 'Noon' : h < 12 ? `${h} AM` : `${h - 12} PM`
  }
</script>

<div class="calendar">
  <div class="cal-header">
    <div class="nav-group">
      <button class="nav-btn" onclick={prev}>&#8249;</button>
      <div class="month-title">{title}</div>
      <button class="nav-btn" onclick={next}>&#8250;</button>
    </div>
    <button class="today-btn" onclick={goToday}>Today</button>
    <div class="view-switcher">
      <button class="view-btn" class:active={view === 'day'} onclick={() => setView('day')}>Day</button>
      <button class="view-btn" class:active={view === '3day'} onclick={() => setView('3day')}>3 Day</button>
      <button class="view-btn" class:active={view === 'week'} onclick={() => setView('week')}>Week</button>
      <button class="view-btn" class:active={view === 'multiweek'} onclick={() => setView('multiweek')}>Multiweek</button>
      <button class="view-btn" class:active={view === 'month'} onclick={() => setView('month')}>Month</button>
    </div>
  </div>

  {#if view === 'month'}
    <div class="grid month-grid">
      {#each DAY_NAMES as name}
        <div class="day-name">{name}</div>
      {/each}
      {#each viewDates as date}
        {#if date === null}
          <div class="cell empty"></div>
        {:else}
          {@const dayEvents = eventsOnDay(date)}
          {@const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()}
          <div class="cell" class:today={isToday}>
            <span class="day-num" class:today-num={isToday}>{date.getDate()}</span>
            <div class="cell-events">
              {#each dayEvents.slice(0, 3) as ev (ev.uid)}
                <button
                  class="ev-pill"
                  class:selected={$selectedEventId === ev.uid}
                  onclick={() => selectEvent(ev.uid)}
                  title={ev.title}
                >
                  {ev.title}
                </button>
              {/each}
              {#if dayEvents.length > 3}
                <span class="more">+{dayEvents.length - 3} more</span>
              {/if}
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {:else if view === 'multiweek'}
    <div class="grid multiweek-grid">
      {#each DAY_NAMES as name}
        <div class="day-name">{name}</div>
      {/each}
      {#each viewDates as date}
        {#if date}
          {@const dayEvents = eventsOnDay(date)}
          {@const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()}
          <div class="cell" class:today={isToday}>
            <span class="day-num" class:today-num={isToday}>{date.getDate()}</span>
            <div class="cell-events">
              {#each dayEvents.slice(0, 3) as ev (ev.uid)}
                <button
                  class="ev-pill"
                  class:selected={$selectedEventId === ev.uid}
                  onclick={() => selectEvent(ev.uid)}
                  title={ev.title}
                >
                  {ev.title}
                </button>
              {/each}
              {#if dayEvents.length > 3}
                <span class="more">+{dayEvents.length - 3} more</span>
              {/if}
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {:else}
    <div class="time-grid" class:day-view={view === 'day'} class:three-day-view={view === '3day'} class:week-view={view === 'week'}>
      <div class="time-header">
        <div class="time-column-header"></div>
        {#each viewDates as date}
          {#if date}
            {@const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()}
            <div class="day-header" class:today={isToday}>
              <span class="day-header-day">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
              <span class="day-header-date" class:today-num={isToday}>{date.getDate()}</span>
            </div>
          {/if}
        {/each}
      </div>
      <div class="time-body">
        <div class="time-gutter">
          {#each Array.from({ length: 24 }, (_, h) => h) as h}
            <div class="hour-label">{formatHour(h)}</div>
          {/each}
        </div>
        {#each viewDates as date}
          {#if date}
            {@const dayStart = startOfDay(date)}
            {@const dayEvents = eventsOnDay(date)}
            <div class="day-column">
              {#each Array.from({ length: 24 }, (_, h) => h) as h}
                <div class="hour-slot"></div>
              {/each}
              {#each dayEvents as ev (ev.uid)}
                <button
                  class="time-event"
                  class:selected={$selectedEventId === ev.uid}
                  style:top={eventStyle(ev, dayStart).top}
                  style:height={eventStyle(ev, dayStart).height}
                  onclick={() => selectEvent(ev.uid)}
                  title={ev.title}
                >
                  <span class="time-event-title">{ev.title}</span>
                </button>
              {/each}
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .calendar {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .cal-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .nav-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .month-title {
    font-size: 1rem;
    color: var(--color-darkGrey, #1b2433);
    min-width: 10rem;
    text-align: center;
  }

  .nav-btn {
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    cursor: pointer;
    padding: 0.2rem 0.6rem;
    font-size: 1.2rem;
    color: var(--color-darkGrey, #1b2433);
    line-height: 1.4;
    transition: background 0.15s;
  }

  .nav-btn:hover {
    background: var(--color-lightGrey, #d9e0eb);
  }

  .today-btn {
    padding: 0.3rem 0.75rem;
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--color-darkGrey, #1b2433);
    transition: background 0.15s;
  }

  .today-btn:hover {
    background: var(--color-lightGrey, #d9e0eb);
  }

  .view-switcher {
    margin-left: auto;
    display: flex;
    gap: 0.2rem;
  }

  .view-btn {
    padding: 0.3rem 0.6rem;
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.8rem;
    color: var(--color-darkGrey, #1b2433);
    transition: background 0.15s;
  }

  .view-btn:hover:not(.active) {
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .view-btn.active {
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border-color: var(--color-primary, #2f63f0);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    flex: 1;
    overflow-y: auto;
    border-left: 1px solid var(--color-lightGrey, #d9e0eb);
    border-top: 1px solid var(--color-lightGrey, #d9e0eb);
  }

  .day-name {
    padding: 0.4rem;
    text-align: center;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-grey, #60708a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-right: 1px solid var(--color-lightGrey, #d9e0eb);
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .cell {
    border-right: 1px solid var(--color-lightGrey, #d9e0eb);
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    padding: 0.3rem;
    min-height: 5.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    background: var(--bg-color, #fff);
    vertical-align: top;
  }

  .cell.empty {
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .cell.today {
    background: rgba(47, 99, 240, 0.04);
  }

  .day-num {
    font-size: 0.82rem;
    color: var(--color-grey, #60708a);
    font-weight: 500;
    align-self: flex-end;
    line-height: 1;
  }

  .today-num {
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border-radius: 50%;
    width: 1.4rem;
    height: 1.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }

  .cell-events {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    overflow: hidden;
  }

  .ev-pill {
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 0.15rem 0.4rem;
    font-size: 0.75rem;
    cursor: pointer;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ev-pill.selected {
    box-shadow: 0 0 0 2px var(--color-darkGrey, #1b2433);
  }

  .more {
    font-size: 0.72rem;
    color: var(--color-grey, #60708a);
    padding: 0 0.3rem;
  }

  .time-grid {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .time-grid.day-view .day-column,
  .time-grid.day-view .day-header {
    flex: 1;
  }

  .time-grid.three-day-view .day-column,
  .time-grid.three-day-view .day-header {
    flex: 1;
  }

  .time-grid.week-view .day-column,
  .time-grid.week-view .day-header {
    flex: 1;
  }

  .time-header {
    display: flex;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  .time-column-header {
    width: 4rem;
    flex-shrink: 0;
    border-right: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .day-header {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.3rem;
    border-right: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-secondary-color, #f5f7fb);
    font-size: 0.85rem;
    color: var(--color-darkGrey, #1b2433);
  }

  .day-header-day {
    font-size: 0.75rem;
    color: var(--color-grey, #60708a);
    text-transform: uppercase;
  }

  .day-header-date {
    font-weight: 600;
  }

  .day-header.today .day-header-date {
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border-radius: 50%;
    width: 1.4rem;
    height: 1.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .time-body {
    display: flex;
    flex: 1;
    overflow-y: auto;
    position: relative;
  }

  .time-gutter {
    width: 4rem;
    flex-shrink: 0;
    border-right: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-color, #fff);
  }

  .hour-label {
    height: 3rem;
    font-size: 0.7rem;
    color: var(--color-grey, #60708a);
    text-align: right;
    padding-right: 0.4rem;
    box-sizing: border-box;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
  }

  .day-column {
    flex: 1;
    position: relative;
    border-right: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-color, #fff);
  }

  .hour-slot {
    height: 3rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
  }

  .time-event {
    position: absolute;
    left: 0.15rem;
    right: 0.15rem;
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 0.15rem 0.3rem;
    font-size: 0.75rem;
    cursor: pointer;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    z-index: 1;
  }

  .time-event.selected {
    box-shadow: 0 0 0 2px var(--color-darkGrey, #1b2433);
  }

  .time-event-title {
    pointer-events: none;
  }
</style>
