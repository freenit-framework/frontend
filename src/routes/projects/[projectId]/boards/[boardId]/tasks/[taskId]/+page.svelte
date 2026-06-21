<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { notification, Spinner, TaskDetail } from '$lib'
  import store from '$lib/store'

  let { data: props } = $props()
  let loading = $state(true)
  let task = $state<any>(null)

  onMount(async () => {
    loading = true
    const response = await store.project.fetchTask(props.taskId)
    if (response.ok) {
      task = response
    } else {
      notification.error(response.statusText)
    }
    loading = false
  })

  function goToBoard() {
    goto(`/projects/${props.projectId}/boards/${props.boardId}`)
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else if task}
  <div class="task-page">
    <button class="button outline" onclick={goToBoard}>Back to board</button>
    <TaskDetail
      {task}
      children={task.children || []}
      parent={task.parent}
      projectId={props.projectId}
      boardId={props.boardId}
      showLink={false}
    />
  </div>
{:else}
  <div class="not-found">Task not found</div>
{/if}

<style>
  .task-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }

  .task-page button {
    align-self: flex-start;
  }

  .not-found {
    padding: 20px;
    text-align: center;
    color: var(--color-grey);
  }
</style>
