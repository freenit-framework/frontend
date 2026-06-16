<script lang="ts">
  import { deleteEvent, selectEvent } from '$lib/calendar/store'
  import type { CalendarEvent } from '$lib/calendar/types'

  let { event, onEdit }: { event: CalendarEvent; onEdit: () => void } = $props()

  let deleting = $state(false)
  let error = $state('')

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit', minute: '2-digit',
  })

  function formatDate(e: CalendarEvent): string {
    if (e.allDay) {
      return dateFormatter.format(e.start)
    }
    if (e.start.toDateString() === e.end.toDateString()) {
      return `${dateFormatter.format(e.start)}, ${timeFormatter.format(e.start)} – ${timeFormatter.format(e.end)}`
    }
    return `${dateFormatter.format(e.start)} ${timeFormatter.format(e.start)} – ${dateFormatter.format(e.end)} ${timeFormatter.format(e.end)}`
  }

  async function handleDelete() {
    if (!confirm(`Delete "${event.title}"?`)) return
    deleting = true
    error = ''
    try {
      await deleteEvent(event)
    } catch (e) {
      error = e instanceof Error ? e.message : 'Delete failed'
    } finally {
      deleting = false
    }
  }
</script>

<div class="viewer">
  <div class="viewer-header">
    <h2 class="title">{event.title}</h2>
    <div class="actions">
      <button class="btn-secondary" onclick={onEdit}>Edit</button>
      <button class="btn-danger" onclick={handleDelete} disabled={deleting}>
        {deleting ? 'Deleting…' : 'Delete'}
      </button>
      <button class="btn-close" onclick={() => selectEvent(null)} title="Close">&#x2715;</button>
    </div>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <div class="fields">
    <div class="field">
      <span class="field-label">When</span>
      <span class="field-value">{formatDate(event)}</span>
    </div>

    {#if event.location}
      <div class="field">
        <span class="field-label">Where</span>
        <span class="field-value">{event.location}</span>
      </div>
    {/if}

    {#if event.calendarName}
      <div class="field">
        <span class="field-label">Calendar</span>
        <span class="field-value">{event.calendarName}</span>
      </div>
    {/if}

    {#if event.status && event.status !== 'CONFIRMED'}
      <div class="field">
        <span class="field-label">Status</span>
        <span class="field-value status-{event.status.toLowerCase()}">{event.status}</span>
      </div>
    {/if}

    {#if event.description}
      <div class="field">
        <span class="field-label">Description</span>
        <span class="field-value description">{event.description}</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .viewer {
    padding: 1.5rem;
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .viewer-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .title {
    flex: 1;
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-darkGrey, #1b2433);
    word-break: break-word;
  }

  .actions {
    display: flex;
    gap: 0.4rem;
    flex-shrink: 0;
  }

  .btn-secondary {
    padding: 0.35rem 0.8rem;
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--color-darkGrey, #1b2433);
    transition: background 0.15s;
  }

  .btn-secondary:hover {
    background: var(--color-lightGrey, #d9e0eb);
  }

  .btn-danger {
    padding: 0.35rem 0.8rem;
    background: none;
    border: 1px solid var(--color-error);
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--color-error, #d43939);
    transition: background 0.15s;
  }

  .btn-danger:hover:not(:disabled) {
    background: var(--bg-error);
  }

  .btn-danger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-close {
    padding: 0.35rem 0.6rem;
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--color-grey, #60708a);
    transition: background 0.15s;
  }

  .btn-close:hover {
    background: var(--color-lightGrey, #d9e0eb);
  }

  .error {
    color: var(--color-error, #d43939);
    font-size: 0.88rem;
    margin-bottom: 1rem;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .field {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .field-label {
    width: 6rem;
    flex-shrink: 0;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-grey, #60708a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding-top: 0.1rem;
  }

  .field-value {
    font-size: 0.92rem;
    color: var(--color-darkGrey, #1b2433);
  }

  .field-value.description {
    white-space: pre-wrap;
  }

  .status-tentative {
    color: #c07000;
  }

  .status-cancelled {
    color: var(--color-error, #d43939);
    text-decoration: line-through;
  }
</style>
