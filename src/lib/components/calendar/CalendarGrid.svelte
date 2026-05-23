<script lang="ts">
  import { events, currentMonth, selectEvent, selectedEventId, ensureYearLoaded } from '$lib/calendar/store'
  import type { CalendarEvent } from '$lib/calendar/types'

  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  function daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate()
  }

  // Monday = 0 … Sunday = 6
  function firstDayOffset(year: number, month: number): number {
    const day = new Date(year, month, 1).getDay()
    return (day + 6) % 7
  }

  function eventsOnDay(date: Date): CalendarEvent[] {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(dayStart.getTime() + 86400000)
    return $events.filter((e) => e.start < dayEnd && e.end > dayStart)
  }

  const year = $derived($currentMonth.getFullYear())
  const month = $derived($currentMonth.getMonth())
  const offset = $derived(firstDayOffset(year, month))
  const days = $derived(daysInMonth(year, month))
  const today = new Date()

  const cells = $derived(
    (() => {
      const total = Math.ceil((offset + days) / 7) * 7
      return Array.from({ length: total }, (_, i) => {
        const dayNum = i - offset + 1
        if (dayNum < 1 || dayNum > days) return null
        return new Date(year, month, dayNum)
      })
    })()
  )

  async function prevMonth() {
    const next = new Date(year, month - 1, 1)
    currentMonth.set(next)
    await ensureYearLoaded(next.getFullYear())
  }

  async function nextMonth() {
    const next = new Date(year, month + 1, 1)
    currentMonth.set(next)
    await ensureYearLoaded(next.getFullYear())
  }

  function goToday() {
    currentMonth.set(new Date())
  }
</script>

<div class="calendar">
  <div class="cal-header">
    <button class="nav-btn" onclick={prevMonth}>&#8249;</button>
    <div class="month-title">
      <strong>{MONTH_NAMES[month]}</strong> {year}
    </div>
    <button class="nav-btn" onclick={nextMonth}>&#8250;</button>
    <button class="today-btn" onclick={goToday}>Today</button>
  </div>

  <div class="grid">
    {#each DAY_NAMES as name}
      <div class="day-name">{name}</div>
    {/each}

    {#each cells as date}
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
    margin-left: auto;
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
    gap: 0.15rem;
  }

  .ev-pill {
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border: none;
    border-radius: 3px;
    padding: 0.1rem 0.4rem;
    font-size: 0.75rem;
    cursor: pointer;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    transition: background 0.15s;
  }

  .ev-pill:hover,
  .ev-pill.selected {
    background: #1e50d8;
  }

  .more {
    font-size: 0.72rem;
    color: var(--color-grey, #60708a);
    padding-left: 0.3rem;
  }
</style>
