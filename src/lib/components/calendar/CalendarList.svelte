<script lang="ts">
  import { onMount } from 'svelte'
  import {
    calendars,
    events,
    selectedCalendarName,
    calendarLoading,
    calendarError,
    initCalendar,
    createCalendar,
    deleteCalendar,
    renameCalendar,
    selectCalendar,
    importEvents,
    exportEvents,
    downloadICal,
    clearCalendar,
  } from '$lib/calendar/store'

  onMount(() => {
    initCalendar()
  })

  let showCreate = $state(false)
  let newCalendarName = $state('')
  let deleting = $state('')
  let editing = $state('')
  let editName = $state('')
  let message = $state('')
  let fileInput: HTMLInputElement | null = $state(null)
  let importing = $state(false)
  let importProgress = $state({ current: 0, total: 0 })
  let clearing = $state(false)

  function bookIdFromName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'calendar'
  }

  async function handleCreate() {
    const displayName = newCalendarName.trim()
    if (!displayName) return
    try {
      await createCalendar(bookIdFromName(displayName), displayName)
      newCalendarName = ''
      showCreate = false
      message = ''
    } catch (err) {
      message = err instanceof Error ? err.message : 'Failed to create calendar'
    }
  }

  async function handleDelete(name: string) {
    const cal = $calendars.find((c) => c.name === name)
    if (!cal) return
    if (!confirm(`Delete calendar "${cal.displayName || cal.name}"? This will also delete all events in it.`)) {
      return
    }
    deleting = name
    try {
      await deleteCalendar(cal)
      message = ''
    } catch (err) {
      message = err instanceof Error ? err.message : 'Failed to delete calendar'
    } finally {
      deleting = ''
    }
  }

  function startEdit(cal: { name: string; displayName: string }) {
    editing = cal.name
    editName = cal.displayName || cal.name
    message = ''
  }

  function handleImportClick() {
    message = ''
    fileInput?.click()
  }

  async function handleFileSelected(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    if ($selectedCalendarName === '') {
      message = 'No calendar selected.'
      return
    }

    importing = true
    message = ''
    importProgress = { current: 0, total: 0 }
    try {
      const result = await importEvents(file, $selectedCalendarName, (current, total) => {
        importProgress = { current, total }
      })
      if (result.failed === 0) {
        message = `Imported ${result.imported} event${result.imported === 1 ? '' : 's'}.`
      } else {
        message = `Imported ${result.imported}, failed ${result.failed}.`
      }
    } catch (err) {
      message = err instanceof Error ? err.message : 'Import failed'
    } finally {
      importing = false
      importProgress = { current: 0, total: 0 }
    }
  }

  async function handleClearClick() {
    message = ''
    const calName = $selectedCalendarName
    if (calName === '') {
      message = 'No calendar selected.'
      return
    }
    const cal = $calendars.find((c) => c.name === calName)
    const count = $events.filter((e) => e.calendarName === calName).length
    if (count === 0) {
      message = 'No events to clear.'
      return
    }
    if (!confirm(`Clear all ${count} event${count === 1 ? '' : 's'} from calendar "${cal?.displayName || calName}"? This cannot be undone.`)) {
      return
    }
    clearing = true
    try {
      await clearCalendar(calName)
      message = `Cleared ${count} event${count === 1 ? '' : 's'}.`
    } catch (err) {
      message = err instanceof Error ? err.message : 'Failed to clear calendar'
    } finally {
      clearing = false
    }
  }

  function handleExportClick() {
    message = ''
    const calName = $selectedCalendarName
    if (calName === '') {
      message = 'No calendar selected.'
      return
    }
    const ics = exportEvents(calName)
    if (!ics) {
      message = 'No events to export.'
      return
    }
    const cal = $calendars.find((c) => c.name === calName)
    const fileName = `${(cal?.displayName || calName).replace(/[^a-z0-9_\-]/gi, '_')}.ics`
    downloadICal(ics, fileName)
  }

  async function handleRename(cal: { name: string; displayName: string }) {
    const name = editName.trim()
    if (!name || name === cal.displayName) {
      editing = ''
      return
    }
    try {
      await renameCalendar(cal, name)
      editing = ''
      message = ''
    } catch (err) {
      message = err instanceof Error ? err.message : 'Failed to rename calendar'
    }
  }
</script>

<div class="calendar-list">
  <div class="section-header">
    <span class="section-title">Calendars</span>
    <button
      class="icon-btn"
      title="New calendar"
      onclick={() => { showCreate = !showCreate; message = '' }}
    >
      +
    </button>
  </div>

  <div class="calendar-actions">
    <button
      class="action-btn"
      onclick={handleImportClick}
      disabled={importing || $selectedCalendarName === ''}
    >
      {importing ? `Importing ${importProgress.current}/${importProgress.total}` : 'Import'}
    </button>
    <button
      class="action-btn"
      onclick={handleExportClick}
      disabled={!$selectedCalendarName}
    >
      Export
    </button>
    <button
      class="action-btn danger"
      onclick={handleClearClick}
      disabled={clearing || !$selectedCalendarName}
    >
      {clearing ? 'Clearing…' : 'Clear'}
    </button>
  </div>

  {#if showCreate}
    <div class="create-form">
      <input
        type="text"
        placeholder="Calendar name"
        bind:value={newCalendarName}
      />
      <div class="form-actions">
        <button class="save-btn" onclick={handleCreate} disabled={!newCalendarName.trim()}>
          Create
        </button>
        <button onclick={() => showCreate = false}>Cancel</button>
      </div>
    </div>
  {/if}

  {#if message}
    <div class="message" class:error={message.includes('failed') || message.includes('No')}>
      {message}
    </div>
  {/if}

  <input
    bind:this={fileInput}
    type="file"
    accept=".ics,.ical,.ifb,.icalendar,text/calendar"
    onchange={handleFileSelected}
    class="file-input"
  />

  <nav class="calendar-items">
    <button
      class="calendar-item"
      class:active={$selectedCalendarName === ''}
      onclick={() => selectCalendar('')}
    >
      <span class="calendar-name">All</span>
      <span class="calendar-count">{$events.length}</span>
    </button>
    {#each $calendars as cal (cal.name)}
      {#if editing === cal.name}
        <div class="calendar-item editing">
          <input
            type="text"
            bind:value={editName}
            onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleRename(cal) } else if (e.key === 'Escape') { editing = '' } }}
          />
          <div class="edit-actions">
            <button class="save-btn" onclick={() => handleRename(cal)}>Save</button>
            <button onclick={() => editing = ''}>Cancel</button>
          </div>
        </div>
      {:else}
        <button
          class="calendar-item"
          class:active={$selectedCalendarName === cal.name}
          onclick={() => selectCalendar(cal.name)}
        >
          <span class="calendar-name">{cal.displayName || cal.name}</span>
          <span class="calendar-count">
            {$events.filter((e) => e.calendarName === cal.name).length}
          </span>
          <span
            class="edit-cal"
            onclick={(e) => { e.stopPropagation(); startEdit(cal) }}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); startEdit(cal) } }}
            role="button"
            tabindex={0}
            title="Rename calendar"
          >
            ✎
          </span>
          <span
            class="delete-cal"
            onclick={(e) => { e.stopPropagation(); handleDelete(cal.name) }}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleDelete(cal.name) } }}
            role="button"
            tabindex={0}
            title="Delete calendar"
          >
            {deleting === cal.name ? '…' : '×'}
          </span>
        </button>
      {/if}
    {/each}
  </nav>

  {#if $calendarLoading && $calendars.length === 0}
    <div class="state-msg">Loading calendars…</div>
  {:else if $calendarError}
    <div class="state-msg error">{$calendarError}</div>
  {:else if $calendars.length === 0 && !$calendarLoading}
    <div class="state-msg">No calendars found.</div>
  {/if}
</div>

<style>
  .calendar-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 240px;
    flex-shrink: 0;
    border-right: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-secondary-color, #f5f7fb);
    overflow: hidden;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 1rem;
    flex-shrink: 0;
  }

  .calendar-actions {
    display: flex;
    gap: 0.4rem;
    padding: 0 1rem 0.6rem;
    flex-shrink: 0;
  }

  .action-btn {
    flex: 1;
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    background: #fff;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-darkGrey, #1b2433);
    transition: background 0.15s, color 0.15s;
  }

  .action-btn:hover:not(:disabled) {
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .action-btn.danger {
    color: var(--color-error, #d43939);
    border-color: var(--color-error, #d43939);
  }

  .action-btn.danger:hover:not(:disabled) {
    background: var(--color-error, #d43939);
    color: #fff;
  }

  .section-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-grey, #60708a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .icon-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    color: var(--color-darkGrey, #1b2433);
  }

  .icon-btn:hover:not(:disabled) {
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .icon-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .create-form {
    padding: 0 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .create-form input {
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    font-size: 0.85rem;
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
  }

  .form-actions button {
    padding: 0.35rem 0.7rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    background: #fff;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .save-btn {
    background: var(--color-primary, #2f63f0) !important;
    color: #fff;
    border-color: var(--color-primary, #2f63f0) !important;
  }

  .save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .message {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    color: var(--color-success, #28bd14);
    background: #f0fdf0;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  .message.error {
    color: var(--color-error, #d43939);
    background: #fdf2f2;
  }

  .file-input {
    display: none;
  }

  .calendar-items {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex: 1;
  }

  .calendar-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    font-size: 0.88rem;
    color: var(--color-darkGrey, #1b2433);
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    transition: background 0.1s;
  }

  .calendar-item:hover {
    background: var(--bg-color, #fff);
  }

  .calendar-item.active {
    background: var(--bg-color, #fff);
    font-weight: 600;
  }

  .calendar-item.editing {
    background: var(--bg-color, #fff);
    flex-wrap: wrap;
  }

  .calendar-item.editing input {
    flex: 1 1 100%;
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    font-size: 0.85rem;
  }

  .edit-actions {
    display: flex;
    gap: 0.4rem;
    flex: 1 1 100%;
  }

  .edit-actions button {
    padding: 0.25rem 0.6rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    background: #fff;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.78rem;
  }

  .edit-actions .save-btn {
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border-color: var(--color-primary, #2f63f0);
  }

  .calendar-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .calendar-count {
    font-size: 0.75rem;
    color: var(--color-grey, #60708a);
    background: var(--bg-secondary-color, #f5f7fb);
    padding: 0.1rem 0.4rem;
    border-radius: 10px;
  }

  .delete-cal {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1rem;
    line-height: 1;
    color: var(--color-grey, #60708a);
    cursor: pointer;
  }

  .edit-cal {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 0.85rem;
    line-height: 1;
    color: var(--color-grey, #60708a);
    cursor: pointer;
  }

  .edit-cal:hover {
    background: var(--color-primary, #2f63f0);
    color: #fff;
  }

  .delete-cal:hover {
    background: var(--color-error, #d43939);
    color: #fff;
  }

  .state-msg {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    color: var(--color-grey, #60708a);
    text-align: center;
  }

  .state-msg.error {
    color: var(--color-error, #d43939);
  }
</style>
