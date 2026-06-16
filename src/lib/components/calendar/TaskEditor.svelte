<script lang="ts">
  import { calendars, selectedCalendarName, saveTask, selectTask } from '$lib/calendar/store'
  import type { CalendarTask } from '$lib/calendar/types'
  import { dateToDateInput, dateToLocalInput, localInputToDate } from '$lib/calendar/ical'

  let {
    task = null,
    onCancel,
  }: {
    task?: CalendarTask | null
    onCancel: () => void
  } = $props()

  const isNew = $derived(!task)

  // Form state; synced from the task prop so selecting a different task resets the form.
  let title = $state('')
  let allDay = $state(true)
  let dueInput = $state('')
  let description = $state('')
  let location = $state('')
  let status = $state('NEEDS-ACTION')
  let priority = $state(0)
  let percentComplete = $state(0)
  let calendarName = $state('')

  let saving = $state(false)
  let error = $state('')

  $effect(() => {
    const baseDue = task?.due ?? new Date()

    title = task?.title ?? ''
    allDay = task?.allDay ?? true
    dueInput = task
      ? (task.allDay ? dateToDateInput(task.due ?? new Date()) : dateToLocalInput(task.due ?? new Date()))
      : dateToDateInput(baseDue)
    description = task?.description ?? ''
    location = task?.location ?? ''
    status = task?.status ?? 'NEEDS-ACTION'
    priority = task?.priority ?? 0
    percentComplete = task?.percentComplete ?? 0
    calendarName = task?.calendarName ?? $selectedCalendarName ?? $calendars[0]?.name ?? ''
  })

  async function handleSave() {
    if (!title.trim()) {
      error = 'Title is required'
      return
    }
    if (!calendarName) {
      error = 'No calendar available'
      return
    }

    saving = true
    error = ''
    try {
      const uid = task?.uid ?? crypto.randomUUID()
      const due = allDay ? new Date(dueInput) : localInputToDate(dueInput)
      await saveTask({
        uid,
        href: task?.href ?? `/cal/${calendarName}/${uid}.ics`,
        etag: task?.etag ?? '',
        calendarName,
        title: title.trim(),
        due,
        allDay,
        description: description.trim(),
        location: location.trim(),
        status,
        priority,
        percentComplete,
        completed: status === 'COMPLETED' ? (task?.completed ?? new Date()) : null,
        isNew,
      })
      selectTask(uid)
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
    <h2>{isNew ? 'New Task' : 'Edit Task'}</h2>
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
      <input type="text" bind:value={title} placeholder="Task title" autofocus />
    </label>

    <div class="allday-row">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={allDay} />
        <span>All day</span>
      </label>
    </div>

    <label>
      <span class="label">Due</span>
      {#if allDay}
        <input type="date" bind:value={dueInput} />
      {:else}
        <input type="datetime-local" bind:value={dueInput} />
      {/if}
    </label>

    <label>
      <span class="label">Status</span>
      <select bind:value={status}>
        <option value="NEEDS-ACTION">Needs action</option>
        <option value="IN-PROCESS">In process</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </label>

    <div class="field-row">
      <label>
        <span class="label">Priority</span>
        <input type="number" min="0" max="9" bind:value={priority} />
      </label>

      <label>
        <span class="label">%</span>
        <input type="number" min="0" max="100" bind:value={percentComplete} />
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
    color: var(--color-darkGrey);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.88rem;
    font-weight: 600;
    transition: background 0.15s;
  }

  .btn-primary:hover:not(:disabled) { filter: brightness(0.9); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-secondary {
    padding: 0.4rem 1rem;
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.88rem;
    color: var(--color-darkGrey, #1b2433);
    transition: background 0.15s;
  }

  .btn-secondary:hover:not(:disabled) { background: var(--color-lightGrey, #d9e0eb); }
  .btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }

  .error {
    color: var(--color-error, #d43939);
    background: var(--bg-error);
    padding: 0.5rem 0.75rem;
    border-radius: 5px;
    margin-bottom: 1rem;
    font-size: 0.85rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-grey, #60708a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  input, select, textarea {
    padding: 0.45rem 0.65rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    font-size: 0.88rem;
    background: var(--bg-color, #fff);
    color: var(--color-darkGrey, #1b2433);
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--color-primary, #2f63f0);
  }

  .allday-row {
    display: flex;
  }

  .checkbox-label {
    flex-direction: row;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.88rem;
    color: var(--color-darkGrey, #1b2433);
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
</style>
