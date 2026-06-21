<script lang="ts">
  let {
    task,
    children = [],
    parent = null,
    projectId,
    boardId,
    showLink = false,
    onSelectChild = undefined,
  } = $props()

  function taskUrl(id: number): string {
    return `/projects/${projectId}/boards/${boardId}/tasks/${id}`
  }

  function handleChildClick(child: any, event: MouseEvent) {
    if (onSelectChild) {
      event.preventDefault()
      onSelectChild(child)
    }
  }
</script>

<div class="task-detail">
  <h2 class="title">
    {#if showLink}
      <a href={taskUrl(task.id)}>{task.title}</a>
    {:else}
      {task.title}
    {/if}
  </h2>

  <div class="section">
    <span class="label">Description</span>
    <p class="description">{task.description || 'No description'}</p>
  </div>

  <div class="section">
    <span class="label">Parent task</span>
    {#if parent}
      <a href={taskUrl(parent.id)}>{parent.title}</a>
    {:else}
      <span class="empty">No parent task</span>
    {/if}
  </div>

  <div class="section">
    <span class="label">Child tasks</span>
    {#if children.length > 0}
      <ul class="child-list">
        {#each children as child (child.id)}
          <li>
            <a href={taskUrl(child.id)} onclick={(e) => handleChildClick(child, e)}>
              {child.title}
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <span class="empty">No child tasks</span>
    {/if}
  </div>
</div>

<style>
  .task-detail {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .title {
    margin: 0;
    font-size: 1.5rem;
  }

  .title a {
    color: var(--color-primary);
    text-decoration: none;
  }

  .title a:hover {
    text-decoration: underline;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label {
    font-size: 0.875rem;
    color: var(--color-grey);
  }

  .description {
    margin: 0;
    white-space: pre-wrap;
  }

  .empty {
    color: var(--color-grey);
    font-style: italic;
  }

  .child-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .child-list li {
    margin-bottom: 4px;
  }

  .child-list a {
    color: var(--color-primary);
    text-decoration: none;
  }

  .child-list a:hover {
    text-decoration: underline;
  }
</style>
