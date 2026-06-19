<script lang="ts">
  import { onMount } from 'svelte'
  import Modal from '$lib/Modal.svelte'
  import Input from './Input.svelte'
  import Spinner from './Spinner.svelte'
  import { notification } from '$lib'

  let { projectId, store } = $props()
  let loading = $state(true)
  let showCreate = $state(false)
  let name = $state('')
  let description = $state('')

  onMount(async () => {
    const [projectResponse, boardsResponse] = await Promise.all([
      store.project.fetch(projectId),
      store.project.fetchBoards(projectId),
    ])
    if (!projectResponse.ok) {
      notification.error(projectResponse.statusText)
    }
    if (!boardsResponse.ok) {
      notification.error(boardsResponse.statusText)
    }
    loading = false
  })

  async function fetchPrevious() {
    const response = await store.project.fetchBoards(
      projectId,
      store.project.boardList.page - 1,
    )
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.project.fetchBoards(
      projectId,
      store.project.boardList.page + 1,
    )
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  function toggleShowCreate(event: Event) {
    event.preventDefault()
    showCreate = !showCreate
  }

  async function create(event: Event) {
    event.preventDefault()
    const response = await store.project.createBoard(projectId, {
      name,
      description: description || undefined,
    })
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      name = ''
      description = ''
      showCreate = false
    }
  }

  async function destroy(id: number) {
    const response = await store.project.destroyBoard(id)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="root">
    <div class="container">
      <div class="header">
        <div>
          <h2>{store.project.detail.name}</h2>
          <p>{store.project.detail.description || ''}</p>
        </div>
        <button class="button primary" onclick={toggleShowCreate}>Create Board</button>
      </div>
      <div class="table">
        <div class="heading">ID</div>
        <div class="heading">Name</div>
        <div class="heading">Description</div>
        <div class="heading">Actions</div>
        {#each store.project.boardList.data as board (board.id)}
          <div class="data">{board.id}</div>
          <div class="data">
            <a href={`/projects/${projectId}/boards/${board.id}`}>{board.name}</a>
          </div>
          <div class="data">{board.description || ''}</div>
          <div class="data">
            <button class="button error" onclick={() => destroy(board.id)}>Delete</button>
          </div>
          <div class="border"></div>
        {/each}
      </div>
    </div>
    <div class="actions">
      <button
        class="button"
        disabled={store.project.boardList.page === 1}
        onclick={fetchPrevious}
      >
        &lt;
      </button>
      {store.project.boardList.page}
      <button
        class="button"
        disabled={store.project.boardList.page >= store.project.boardList.pages}
        onclick={fetchNext}
      >
        &gt;
      </button>
    </div>
  </div>
{/if}

<Modal open={showCreate}>
  <h2>Create Board</h2>
  <form onsubmit={create}>
    <Input bind:value={name} autofocus required type="text" name="name" label="Name" />
    <Input bind:value={description} type="text" name="description" label="Description" />
    <div class="actions">
      <button class="button primary" type="submit">Create</button>
      <button class="button error" onclick={toggleShowCreate}>Close</button>
    </div>
  </form>
</Modal>

<style>
  .table {
    border: 1px solid var(--color-lightGrey);
    border-radius: 5px;
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(4, auto);
  }

  .heading {
    font-weight: bold;
    background-color: var(--bg-secondary-color);
    padding: 5px;
  }

  .data {
    padding: 5px;
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

  .border {
    grid-column: 1 / 5;
    border-top: 1px solid var(--color-lightGrey);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
