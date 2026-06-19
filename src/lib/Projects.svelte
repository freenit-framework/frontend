<script lang="ts">
  import { onMount } from 'svelte'
  import Modal from '$lib/Modal.svelte'
  import Input from './Input.svelte'
  import Spinner from './Spinner.svelte'
  import { notification } from '$lib'

  let loading = $state(true)
  let showCreate = $state(false)
  let name = $state('')
  let description = $state('')
  let { store } = $props()

  onMount(async () => {
    const response = await store.project.fetchAll()
    if (!response.ok) {
      notification.error(response.statusText)
    }
    loading = false
  })

  async function fetchPrevious() {
    const response = await store.project.fetchAll(store.project.list.page - 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.project.fetchAll(store.project.list.page + 1)
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
    const response = await store.project.create({
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
    const response = await store.project.destroy(id)
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
        <h2>Projects</h2>
        <button class="button primary" onclick={toggleShowCreate}>Create</button>
      </div>
      <div class="table">
        <div class="heading">ID</div>
        <div class="heading">Name</div>
        <div class="heading">Description</div>
        <div class="heading">Actions</div>
        {#each store.project.list.data as project (project.id)}
          <div class="data">{project.id}</div>
          <div class="data">
            <a href={`/projects/${project.id}`}>{project.name}</a>
          </div>
          <div class="data">{project.description || ''}</div>
          <div class="data">
            <button class="button error" onclick={() => destroy(project.id)}>Delete</button>
          </div>
          <div class="border"></div>
        {/each}
      </div>
    </div>
    <div class="actions">
      <button class="button" disabled={store.project.list.page === 1} onclick={fetchPrevious}>
        &lt;
      </button>
      {store.project.list.page}
      <button
        class="button"
        disabled={store.project.list.page >= store.project.list.pages}
        onclick={fetchNext}
      >
        &gt;
      </button>
    </div>
  </div>
{/if}

<Modal open={showCreate}>
  <h2>Create Project</h2>
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
