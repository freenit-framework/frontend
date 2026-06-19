<script lang="ts">
  import KanbanTask from './KanbanTask.svelte'

  let { column, tasks, selectedTaskId = null, onDropTask, onSelect = undefined, onDelete = undefined, onDragOver = undefined } = $props()
  let dragOver = $state(false)

  const taskIds = $derived(new Set(tasks.map((t: any) => t.id)))
  const roots = $derived(
    tasks.filter((task: any) => !task.parent_id || !taskIds.has(task.parent_id)),
  )
  const childrenByParent = $derived(
    tasks.reduce((map: Map<number, any[]>, task: any) => {
      if (task.parent_id && taskIds.has(task.parent_id)) {
        const list = map.get(task.parent_id) || []
        list.push(task)
        map.set(task.parent_id, list)
      }
      return map
    }, new Map<number, any[]>()),
  )

  function childrenOf(taskId: number) {
    return childrenByParent.get(taskId) || []
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    event.dataTransfer!.dropEffect = 'move'
    dragOver = true
    onDragOver?.(column)
  }

  function handleDragLeave() {
    dragOver = false
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    dragOver = false
    const taskId = Number(event.dataTransfer?.getData('text/plain'))
    if (taskId) {
      onDropTask(taskId, column.id)
    }
  }
</script>

<div
  class="column"
  class:drag-over={dragOver}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  role="list"
  aria-label={column.name}
>
  <div class="header">
    <span>{column.name}</span>
    {#if onDelete}
      <button class="button small error" onclick={() => onDelete(column.id)}>×</button>
    {/if}
  </div>
  <div class="tasks">
    {#each roots as task (task.id)}
      {@const children = childrenOf(task.id)}
      <KanbanTask
        {task}
        hasChildren={children.length > 0}
        childCount={children.length}
        selected={task.id === selectedTaskId}
        onSelect={onSelect}
      />
      {#if children.length > 0}
        <div class="children">
          {#each children as child (child.id)}
            <KanbanTask
              task={child}
              selected={child.id === selectedTaskId}
              onSelect={onSelect}
            />
          {/each}
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .column {
    background: var(--bg-secondary-color);
    border: 2px solid transparent;
    border-radius: 6px;
    padding: 10px;
    min-width: 260px;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 220px);
  }

  .column.drag-over {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--bg-secondary-color) 90%, var(--color-primary));
  }

  .header {
    font-weight: bold;
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--color-lightGrey);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header button {
    padding: 0 8px;
    line-height: 1.4;
  }

  .tasks {
    overflow-y: auto;
    flex: 1;
  }

  .children {
    margin-left: 16px;
    margin-bottom: 10px;
  }
</style>
