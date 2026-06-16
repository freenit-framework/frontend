<script lang="ts">
  import CalendarList from './components/calendar/CalendarList.svelte'
  import CalendarGrid from './components/calendar/CalendarGrid.svelte'
  import EventViewer from './components/calendar/EventViewer.svelte'
  import EventEditor from './components/calendar/EventEditor.svelte'
  import TaskList from './components/calendar/TaskList.svelte'
  import TaskEditor from './components/calendar/TaskEditor.svelte'
  import { selectedEvent, selectedTask, selectEvent, selectTask, calendars, selectedCalendarName, saveEvent } from './calendar/store'
  import { parseICalEvents } from './calendar/ical'
  import type { CalendarEvent } from './calendar/types'

  type Panel = 'tasks' | 'view' | 'edit' | 'new' | 'import' | 'taskNew' | 'taskEdit'

  let panel = $state<Panel>('tasks')
  let importUrl = $state('')
  let importLoading = $state(false)
  let importError = $state('')
  let importPreview = $state<CalendarEvent[]>([])
  let importCalendar = $state('')
  let importDone = $state(false)

  $effect(() => { importCalendar = $selectedCalendarName || '' })

  function handleNew() { selectTask(null); selectEvent(null); panel = 'new' }
  function handleEdit() { panel = 'edit' }
  function handleCancel() { panel = 'tasks' }
  function handleNewTask() { selectEvent(null); selectTask(null); panel = 'taskNew' }
  function handleEditTask() { panel = 'taskEdit' }
  $effect(() => { if ($selectedEvent) panel = 'view' })

  async function fetchIcal() {
    if (!importUrl.trim()) return
    importLoading = true
    importError = ''
    importPreview = []
    importDone = false
    try {
      const resp = await fetch('/api/v1/cal/fetch-ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim() }),
        credentials: 'include',
      })
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}))
        throw new Error(body.detail ?? `HTTP ${resp.status}`)
      }
      const ical = await resp.text()
      const now = new Date()
      const yearStart = new Date(now.getFullYear(), 0, 1)
      const yearEnd = new Date(now.getFullYear() + 1, 0, 1)
      const parsed = parseICalEvents(ical, yearStart, yearEnd)
      importPreview = parsed.map((ev) => ({
        ...ev,
        href: '',
        etag: '',
        calendarName: importCalendar,
      }))
    } catch (e) {
      importError = e instanceof Error ? e.message : 'Failed to fetch calendar'
    } finally {
      importLoading = false
    }
  }

  async function importEvents() {
    if (!importCalendar || importPreview.length === 0) return
    importLoading = true
    importError = ''
    let errors = 0
    for (const ev of importPreview) {
      const uid = crypto.randomUUID()
      try {
        await saveEvent({
          ...ev,
          uid,
          href: `/cal/${importCalendar}/${uid}.ics`,
          etag: '',
          calendarName: importCalendar,
          isNew: true,
        })
      } catch { errors++ }
    }
    importLoading = false
    if (errors > 0) {
      importError = `${errors} event(s) failed to import.`
    } else {
      importDone = true
      importPreview = []
      importUrl = ''
      setTimeout(() => { panel = 'tasks'; importDone = false }, 1500)
    }
  }

  const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
</script>

<div class="calendar-layout">
  <CalendarList />

  <div class="grid-pane">
    <div class="toolbar">
      <button class="new-btn" onclick={handleNew} disabled={!$selectedCalendarName}>New Event</button>
      <button class="import-btn" onclick={() => { panel = panel === 'import' ? 'view' : 'import' }} disabled={!$selectedCalendarName}>
        Subscribe to Calendar
      </button>
    </div>
    <div class="grid-wrapper">
      <CalendarGrid />
    </div>
  </div>

  {#if panel === 'import'}
    <div class="detail-pane">
      <div class="import-panel">
        <h3>Subscribe to Calendar</h3>
        <p class="import-hint">Fetch a remote iCal URL and import events into a local calendar.</p>

        <label>
          <span class="label">iCal URL</span>
          <input
            type="url"
            bind:value={importUrl}
            placeholder="https://example.com/calendar.ics"
          />
        </label>

        {#if $calendars.length > 1}
          <label>
            <span class="label">Import into</span>
            <select bind:value={importCalendar}>
              {#each $calendars as cal (cal.name)}
                <option value={cal.name}>{cal.displayName}</option>
              {/each}
            </select>
          </label>
        {/if}

        <button class="btn-primary" onclick={fetchIcal} disabled={importLoading || !importUrl.trim()}>
          {importLoading ? 'Fetching…' : 'Fetch'}
        </button>

        {#if importError}
          <div class="import-error">{importError}</div>
        {/if}

        {#if importDone}
          <div class="import-success">Imported successfully.</div>
        {/if}

        {#if importPreview.length > 0}
          <div class="preview">
            <div class="preview-header">
              {importPreview.length} event(s) found
              <button class="btn-primary btn-sm" onclick={importEvents} disabled={importLoading}>
                {importLoading ? 'Importing…' : 'Import all'}
              </button>
            </div>
            <ul class="preview-list">
              {#each importPreview.slice(0, 20) as ev (ev.uid ?? ev.title)}
                <li>
                  <span class="ev-title">{ev.title}</span>
                  <span class="ev-date">{dateFmt.format(ev.start)}</span>
                </li>
              {/each}
              {#if importPreview.length > 20}
                <li class="more">…and {importPreview.length - 20} more</li>
              {/if}
            </ul>
          </div>
        {/if}
      </div>
    </div>
  {:else if panel === 'new' || panel === 'edit' || $selectedEvent}
    <div class="detail-pane">
      {#if panel === 'new'}
        <EventEditor onCancel={handleCancel} />
      {:else if panel === 'edit' && $selectedEvent}
        <EventEditor event={$selectedEvent} onCancel={handleCancel} />
      {:else if $selectedEvent}
        <EventViewer event={$selectedEvent} onEdit={handleEdit} />
      {/if}
    </div>
  {:else if panel === 'taskNew' || panel === 'taskEdit' || $selectedTask}
    <div class="detail-pane">
      {#if panel === 'taskNew'}
        <TaskEditor onCancel={handleCancel} />
      {:else if panel === 'taskEdit' && $selectedTask}
        <TaskEditor task={$selectedTask} onCancel={handleCancel} />
      {:else if $selectedTask}
        <TaskList onNew={handleNewTask} onEdit={handleEditTask} />
      {/if}
    </div>
  {:else}
    <div class="detail-pane">
      <TaskList onNew={handleNewTask} onEdit={handleEditTask} />
    </div>
  {/if}
</div>

<style>
  .calendar-layout {
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .grid-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .new-btn {
    padding: 0.35rem 0.9rem;
    background: var(--color-primary, #2f63f0);
    color: var(--color-darkGrey);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.88rem;
    font-weight: 600;
    transition: background 0.15s;
  }

  .new-btn:hover:not(:disabled) { filter: brightness(0.9); }
  .new-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .import-btn {
    padding: 0.35rem 0.9rem;
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.88rem;
    color: var(--color-darkGrey, #1b2433);
    transition: background 0.15s;
  }

  .import-btn:hover:not(:disabled) { background: var(--color-lightGrey, #d9e0eb); }
  .import-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .grid-wrapper { flex: 1; overflow: hidden; }

  .detail-pane {
    width: 340px;
    flex-shrink: 0;
    overflow-y: auto;
    border-left: 1px solid var(--color-lightGrey, #d9e0eb);
  }

  .import-panel {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-darkGrey, #1b2433);
  }

  .import-hint {
    margin: 0;
    font-size: 0.85rem;
    color: var(--color-grey, #60708a);
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

  input, select {
    padding: 0.45rem 0.65rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    font-size: 0.88rem;
    background: var(--bg-color, #fff);
    color: var(--color-darkGrey, #1b2433);
  }

  input:focus, select:focus {
    outline: none;
    border-color: var(--color-primary, #2f63f0);
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
    align-self: flex-start;
    transition: background 0.15s;
  }

  .btn-primary:hover:not(:disabled) { filter: brightness(0.9); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-sm { padding: 0.25rem 0.65rem; font-size: 0.82rem; }

  .import-error {
    color: var(--color-error, #d43939);
    font-size: 0.85rem;
    padding: 0.4rem 0.6rem;
    background: var(--bg-error);
    border-radius: 4px;
  }

  .import-success {
    color: var(--color-success);
    font-size: 0.85rem;
    padding: 0.4rem 0.6rem;
    background: var(--bg-success);
    border-radius: 4px;
  }

  .preview { display: flex; flex-direction: column; gap: 0.5rem; }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-darkGrey, #1b2433);
  }

  .preview-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .preview-list li {
    display: flex;
    flex-direction: column;
    padding: 0.3rem 0;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
  }

  .ev-title {
    font-size: 0.88rem;
    color: var(--color-darkGrey, #1b2433);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ev-date {
    font-size: 0.78rem;
    color: var(--color-grey, #60708a);
  }

  li.more {
    font-size: 0.82rem;
    color: var(--color-grey, #60708a);
    border: none;
  }

  @media (max-width: 900px) {
    .calendar-layout { flex-direction: column; }
    .grid-pane { flex: 1; }
    .detail-pane { width: 100%; height: 45%; border-left: none; border-top: 1px solid var(--color-lightGrey, #d9e0eb); }
  }
</style>
