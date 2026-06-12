<script lang="ts">
  import {
    tasks,
    selectedCalendarName,
    selectTask,
    deleteTask,
    toggleTaskComplete,
    selectedTaskId,
  } from '$lib/calendar/store'
  import type { CalendarTask } from '$lib/calendar/types'

  let { onNew, onEdit }: { onNew: () => void; onEdit: () => void } = $props()

  const filtered = $derived(
    $tasks.filter(
      (t) => $selectedCalendarName === '' || t.calendarName === $selectedCalendarName,
    ),
  )

  const dateFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
  const dateTimeFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  function formatDue(task: CalendarTask): string {
    if (!task.due) return ''
    return task.allDay ? dateFmt.format(task.due) : dateTimeFmt.format(task.due)
  }

  function statusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'completed'
      case 'IN-PROCESS': return 'in-process'
      case 'CANCELLED': return 'cancelled'
      default: return 'needs-action'
    }
  }
</script>

<div class="task-list">
  <div class="task-header">
    <span class="task-title">Tasks ({filtered.length})</span>
    <button class="new-task-btn" onclick={onNew} disabled={$selectedCalendarName === ''}>New Task</button>
  </div>

  {#if filtered.length === 0}
    <div class="empty">No tasks.</div>
  {:else}
    <nav class="task-items">
      {#each filtered as task (task.uid)}
        <div
          class="task-item"
          class:selected={$selectedTaskId === task.uid}
          class:done={task.status === 'COMPLETED'}
        >
          <input
            type="checkbox"
            checked={task.status === 'COMPLETED'}
            onchange={() => toggleTaskComplete(task)}
            class="task-check"
          />
          <button class="task-main" onclick={() => { selectTask(task.uid); onEdit() }}>
            <span class="task-name">{task.title}</span>
            {#if task.due}
              <span class="task-due {statusClass(task.status)}">{formatDue(task)}</span>
            {/if}
          </button>
          <button class="delete-task" onclick={() => deleteTask(task)} title="Delete task">×</button>
        </div>
      {/each}
    </nav>
  {/if}
</div>

<style>
  .task-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .task-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  .task-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-grey, #60708a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .new-task-btn {
    padding: 0.3rem 0.7rem;
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .new-task-btn:hover:not(:disabled) {
    background: #1e50d8;
  }

  .new-task-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .empty {
    padding: 1rem;
    font-size: 0.85rem;
    color: var(--color-grey, #60708a);
    text-align: center;
  }

  .task-items {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .task-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 5px;
    margin-bottom: 0.3rem;
    background: var(--bg-color, #fff);
    border: 1px solid var(--color-lightGrey, #d9e0eb);
  }

  .task-item.selected {
    box-shadow: 0 0 0 2px var(--color-primary, #2f63f0);
  }

  .task-item.done .task-name {
    text-decoration: line-through;
    color: var(--color-grey, #60708a);
  }

  .task-check {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    cursor: pointer;
  }

  .task-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    padding: 0;
    min-width: 0;
  }

  .task-name {
    font-size: 0.88rem;
    color: var(--color-darkGrey, #1b2433);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }

  .task-due {
    font-size: 0.75rem;
  }

  .task-due.needs-action {
    color: var(--color-error, #d43939);
  }

  .task-due.in-process {
    color: var(--color-primary, #2f63f0);
  }

  .task-due.completed {
    color: var(--color-success, #28bd14);
  }

  .task-due.cancelled {
    color: var(--color-grey, #60708a);
    text-decoration: line-through;
  }

  .delete-task {
    width: 1.4rem;
    height: 1.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: var(--color-grey, #60708a);
    font-size: 1.1rem;
    cursor: pointer;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .delete-task:hover {
    background: var(--color-error, #d43939);
    color: #fff;
  }
</style>
