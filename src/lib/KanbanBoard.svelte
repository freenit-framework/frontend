<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { notification } from '$lib'
  import Spinner from './Spinner.svelte'
  import KanbanColumn from './KanbanColumn.svelte'
  import Modal from './Modal.svelte'
  import Input from './Input.svelte'
  import RightPane from './RightPane.svelte'

  let { projectId, boardId, taskId = null, store } = $props()
  let loading = $state(true)
  let showCreateTask = $state(false)
  let showCreateColumn = $state(false)
  let activeColumnId = $state(0)
  let taskTitle = $state('')
  let taskDescription = $state('')
  let columnName = $state('')
  let selectedTaskId = $state<number | null>(null)
  let selectedDescription = $state('')
  let selectedParentId = $state<string | null>(null)

  const selectedTask = $derived(
    selectedTaskId ? store.project.tasks.find((t: any) => t.id === selectedTaskId) : null,
  )

  const selectedTaskChildren = $derived(
    selectedTask
      ? store.project.tasks
          .filter((t: any) => t.parent_id === selectedTask.id)
          .sort((a: any, b: any) => a.title.localeCompare(b.title))
      : [],
  )

  function selectTask(task: any) {
    selectedTaskId = task.id
    selectedDescription = task.description || ''
    selectedParentId = task.parent_id ? String(task.parent_id) : null
  }

  function openTask(task: any) {
    selectTask(task)
    goto(`/projects/${projectId}/boards/${boardId}/tasks/${task.id}`)
  }

  function closeTask() {
    selectedTaskId = null
    selectedDescription = ''
    selectedParentId = null
    goto(`/projects/${projectId}/boards/${boardId}`)
  }

  function normalizeParentId(value: string | null): number | null {
    if (value === null || value === '') return null
    const parsed = parseInt(value, 10)
    return Number.isNaN(parsed) ? null : parsed
  }

  async function saveTask() {
    if (!selectedTask) return
    const fields: Record<string, any> = {}
    if (selectedDescription !== (selectedTask.description || '')) {
      fields.description = selectedDescription || null
    }
    const parentId = normalizeParentId(selectedParentId)
    if (parentId !== (selectedTask.parent_id ?? null)) {
      fields.parent_id = parentId
    }
    if (Object.keys(fields).length === 0) return

    const response = await store.project.editTask(selectedTask.id, fields)
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      selectedDescription = response.description || ''
      selectedParentId = response.parent_id ? String(response.parent_id) : null
    }
  }

  function parentOptions() {
    if (!selectedTask) return []
    return store.project.tasks
      .filter((t: any) => t.id !== selectedTask.id)
      .sort((a: any, b: any) => a.title.localeCompare(b.title))
  }

  onMount(async () => {
    loading = true
    const [boardResponse, columnsResponse] = await Promise.all([
      store.project.fetchBoard(boardId),
      store.project.fetchColumns(boardId),
    ])
    if (!boardResponse.ok) {
      notification.error(boardResponse.statusText)
    }
    if (!columnsResponse.ok) {
      notification.error(columnsResponse.statusText)
    } else {
      await Promise.all(
        store.project.columns.map((column: any) => store.project.fetchTasks(column.id)),
      )
      if (taskId) {
        const task = store.project.tasks.find((t: any) => t.id === taskId)
        if (task) {
          selectTask(task)
        }
      }
    }
    loading = false
  })

  function tasksForColumn(columnId: number) {
    return [...store.project.tasks]
      .filter((task: any) => task.column_id === columnId)
      .sort((a: any, b: any) => a.position - b.position)
  }

  async function handleDropTask(taskId: number, columnId: number) {
    const task = store.project.tasks.find((t: any) => t.id === taskId)
    if (!task || task.column_id === columnId) return

    const response = await store.project.editTask(taskId, { column_id: columnId })
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  function openCreateTask(columnId: number) {
    activeColumnId = columnId
    showCreateTask = true
  }

  function closeCreateTask() {
    showCreateTask = false
    taskTitle = ''
    taskDescription = ''
    activeColumnId = 0
  }

  async function createTask(event: Event) {
    event.preventDefault()
    const response = await store.project.createTask(activeColumnId, {
      title: taskTitle,
      description: taskDescription || undefined,
    })
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      closeCreateTask()
    }
  }

  function closeCreateColumn() {
    showCreateColumn = false
    columnName = ''
  }

  async function createColumn(event: Event) {
    event.preventDefault()
    const response = await store.project.createColumn(boardId, { name: columnName })
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      closeCreateColumn()
      await store.project.fetchTasks(response.id)
    }
  }

  async function deleteColumn(columnId: number) {
    const response = await store.project.destroyColumn(columnId)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <div class="header">
      <h2>{store.project.boardDetail.name}</h2>
      <p>{store.project.boardDetail.description || ''}</p>
    </div>

    <div class="board">
      {#each [...store.project.columns].sort((a: any, b: any) => a.position - b.position) as column (column.id)}
        <div class="column-wrapper">
          <KanbanColumn
            {column}
            tasks={tasksForColumn(column.id)}
            {selectedTaskId}
            onDropTask={handleDropTask}
            onSelect={openTask}
            onDelete={deleteColumn}
          />
          <button class="button small" onclick={() => openCreateTask(column.id)}>
            + Task
          </button>
        </div>
      {/each}
      <button class="button outline add-column" onclick={() => (showCreateColumn = true)}>
        + Column
      </button>
    </div>
  </div>
{/if}

<Modal open={showCreateTask}>
  <h2>Create Task</h2>
  <form onsubmit={createTask}>
    <Input bind:value={taskTitle} autofocus required type="text" name="title" label="Title" />
    <Input
      bind:value={taskDescription}
      type="text"
      name="description"
      label="Description"
    />
    <div class="actions">
      <button class="button primary" type="submit">Create</button>
      <button class="button error" onclick={closeCreateTask} type="button">Close</button>
    </div>
  </form>
</Modal>

<Modal open={showCreateColumn}>
  <h2>Create Column</h2>
  <form onsubmit={createColumn}>
    <Input bind:value={columnName} autofocus required type="text" name="name" label="Name" />
    <div class="actions">
      <button class="button primary" type="submit">Create</button>
      <button class="button error" onclick={closeCreateColumn} type="button">Close</button>
    </div>
  </form>
</Modal>

<RightPane open={selectedTaskId !== null} toggle={closeTask}>
  {#if selectedTask}
    <h3>{selectedTask.title}</h3>
    <div class="field">
      <label for="description">Description</label>
      <textarea id="description" bind:value={selectedDescription} rows="5"></textarea>
    </div>
    <div class="field">
      <label for="parent">Parent task</label>
      <select id="parent" bind:value={selectedParentId}>
        <option value={null}>-- None --</option>
        {#each parentOptions() as task (task.id)}
          <option value={task.id}>{task.title}</option>
        {/each}
      </select>
    </div>
    {#if selectedTaskChildren.length > 0}
      <div class="field">
        <span class="label">Child tickets</span>
        <ul class="child-list">
          {#each selectedTaskChildren as child (child.id)}
            <li>
              <button class="button link" onclick={() => openTask(child)} type="button">
                {child.title}
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
    <div class="actions">
      <button class="button primary" onclick={saveTask} type="button">Save</button>
      <button class="button error" onclick={closeTask} type="button">Close</button>
    </div>
  {/if}
</RightPane>

<style>
  .header {
    margin-bottom: 20px;
  }

  .board {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 10px;
    align-items: flex-start;
  }

  .column-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .column-wrapper button {
    width: 100%;
  }

  .add-column {
    min-width: 120px;
    align-self: flex-start;
  }

  .actions {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
  }

  .actions button {
    margin-left: 10px;
    margin-right: 10px;
  }

  .field {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
  }

  .field label {
    font-size: 0.875rem;
    margin-bottom: 6px;
    color: var(--color-grey);
  }

  .field select {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--color-lightGrey);
    border-radius: 4px;
    background-color: var(--bg-color);
    color: var(--font-color);
  }

  .field textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--color-lightGrey);
    border-radius: 4px;
    background-color: var(--bg-color);
    color: var(--font-color);
    resize: vertical;
    font-family: inherit;
  }

  .field .label {
    font-size: 0.875rem;
    margin-bottom: 6px;
    color: var(--color-grey);
  }

  .child-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .child-list li {
    margin-bottom: 4px;
  }

  .button.link {
    background: none;
    border: none;
    color: var(--color-primary);
    text-align: left;
    padding: 0;
    cursor: pointer;
  }

  .button.link:hover {
    text-decoration: underline;
  }
</style>
