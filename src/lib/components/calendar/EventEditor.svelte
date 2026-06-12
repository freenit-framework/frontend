<script lang="ts">
  import { calendars, selectedCalendarName, saveEvent, selectEvent } from '$lib/calendar/store'
  import type { CalendarEvent } from '$lib/calendar/types'
  import { dateToLocalInput, dateToDateInput, localInputToDate } from '$lib/calendar/ical'

  let {
    event = null,
    defaultDate = null,
    onCancel,
  }: {
    event?: CalendarEvent | null
    defaultDate?: Date | null
    onCancel: () => void
  } = $props()

  const isNew = !event
  const base = defaultDate ?? new Date()

  // Round default start to next hour
  const defaultStart = new Date(base)
  defaultStart.setMinutes(0, 0, 0)
  defaultStart.setHours(defaultStart.getHours() + 1)
  const defaultEnd = new Date(defaultStart.getTime() + 3600000)

  let title = $state(event?.title ?? '')
  let allDay = $state(event?.allDay ?? false)
  let startInput = $state(
    event ? (event.allDay ? dateToDateInput(event.start) : dateToLocalInput(event.start))
          : dateToLocalInput(defaultStart)
  )
  let endInput = $state(
    event ? (event.allDay ? dateToDateInput(event.end) : dateToLocalInput(event.end))
          : dateToLocalInput(defaultEnd)
  )
  let description = $state(event?.description ?? '')
  let location = $state(event?.location ?? '')
  let calendarName = $state(event?.calendarName ?? $selectedCalendarName ?? $calendars[0]?.name ?? '')

  let saving = $state(false)
  let error = $state('')

  async function handleSave() {
    if (!title.trim()) {
      error = 'Title is required'
      return
    }
    if (!calendarName) {
      error = 'No calendar available'
      return
    }

    const start = allDay ? new Date(startInput) : localInputToDate(startInput)
    const end = allDay ? new Date(endInput) : localInputToDate(endInput)

    if (end <= start) {
      error = 'End must be after start'
      return
    }

    saving = true
    error = ''
    try {
      const uid = event?.uid ?? crypto.randomUUID()
      const href = event?.href ?? `/cal/${calendarName}/${uid}.ics`

      await saveEvent({
        uid,
        href,
        etag: event?.etag ?? '',
        calendarName,
        title: title.trim(),
        start,
        end,
        allDay,
        description: description.trim(),
        location: location.trim(),
        status: event?.status ?? 'CONFIRMED',
        isNew,
      })
      selectEvent(uid)
      onCancel()
    } catch (e) {
      error = e instanceof Error ? e.message : 'Save failed'
    } finally {
      saving = false
    }
  }
</script>

<div class="editor">
  <div class="editor-header">
    <h2>{isNew ? 'New Event' : 'Edit Event'}</h2>
    <div class="header-actions">
      <button class="btn-secondary" onclick={onCancel} disabled={saving}>Cancel</button>
      <button class="btn-primary" onclick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <div class="form">
    <label>
      <span class="label">Title</span>
      <input type="text" bind:value={title} placeholder="Event title" autofocus />
    </label>

    <div class="allday-row">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={allDay} />
        <span>All day</span>
      </label>
    </div>

    <div class="field-row">
      <label>
        <span class="label">Start</span>
        {#if allDay}
          <input type="date" bind:value={startInput} />
        {:else}
          <input type="datetime-local" bind:value={startInput} />
        {/if}
      </label>

      <label>
        <span class="label">End</span>
        {#if allDay}
          <input type="date" bind:value={endInput} />
        {:else}
          <input type="datetime-local" bind:value={endInput} />
        {/if}
      </label>
    </div>

    <label>
      <span class="label">Location</span>
      <input type="text" bind:value={location} placeholder="Location" />
    </label>

    <label>
      <span class="label">Description</span>
      <textarea bind:value={description} rows="3" placeholder="Description…"></textarea>
    </label>

    {#if $calendars.length > 1}
      <label>
        <span class="label">Calendar</span>
        <select bind:value={calendarName}>
          {#each $calendars as cal (cal.name)}
            <option value={cal.name}>{cal.displayName}</option>
          {/each}
        </select>
      </label>
    {/if}
  </div>
</div>

<style>
  .editor {
    padding: 1.5rem;
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
  }

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-darkGrey, #1b2433);
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-primary {
    padding: 0.4rem 1rem;
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.88rem;
    font-weight: 600;
    transition: background 0.15s;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1e50d8;
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    padding: 0.4rem 0.9rem;
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.88rem;
    color: var(--color-darkGrey, #1b2433);
    transition: background 0.15s;
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--color-lightGrey, #d9e0eb);
  }

  .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error {
    color: var(--color-error, #d43939);
    font-size: 0.88rem;
    margin-bottom: 1rem;
    padding: 0.5rem 0.75rem;
    background: #fff0f0;
    border-radius: 5px;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field-row {
    display: flex;
    gap: 1rem;
  }

  .field-row label {
    flex: 1;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .allday-row {
    display: flex;
    align-items: center;
  }

  .checkbox-label {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--color-darkGrey, #1b2433);
  }

  .label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-grey, #60708a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  input:not([type='checkbox']),
  textarea,
  select {
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    font-size: 0.9rem;
    font-family: inherit;
    background: var(--bg-color, #fff);
    color: var(--color-darkGrey, #1b2433);
    transition: border-color 0.15s;
  }

  input:not([type='checkbox']):focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: var(--color-primary, #2f63f0);
  }

  textarea {
    resize: vertical;
  }
</style>
