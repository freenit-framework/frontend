<script lang="ts">
  let { task, selected = false, hasChildren = false, childCount = 0, onSelect = undefined, onDragStart = undefined } = $props()

  function handleDragStart(event: DragEvent) {
    event.dataTransfer?.setData('text/plain', String(task.id))
    event.dataTransfer!.effectAllowed = 'move'
    onDragStart?.(task)
  }

  function handleClick() {
    onSelect?.(task)
  }
</script>

<div
  class="task-card"
  class:selected
  draggable="true"
  ondragstart={handleDragStart}
  onclick={handleClick}
  role="button"
  tabindex="0"
  aria-grabbed="true"
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
  <div class="title">
    {#if hasChildren}
      <span class="folder" aria-hidden="true">📁</span>
    {/if}
    {task.title}
    {#if hasChildren && childCount > 0}
      <span class="count">({childCount})</span>
    {/if}
  </div>
  {#if task.description}
    <div class="description">{task.description}</div>
  {/if}
</div>

<style>
  .task-card {
    background: var(--bg-color);
    border: 1px solid var(--color-lightGrey);
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 10px;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .task-card:active {
    cursor: grabbing;
  }

  .task-card.selected {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 30%, transparent);
  }

  .title {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .description {
    font-size: 0.875rem;
    color: var(--color-grey);
  }

  .folder {
    margin-right: 6px;
  }

  .count {
    font-size: 0.75rem;
    color: var(--color-grey);
    margin-left: 4px;
  }
</style>
