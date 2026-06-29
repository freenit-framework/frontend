<script lang="ts">
  import { onMount } from 'svelte'
  import Modal from '$lib/Modal.svelte'
  import { notification } from '$lib'
  import Input from './Input.svelte'
  import Spinner from './Spinner.svelte'

  let loading = $state(true)
  let showCreate = $state(false)
  let name = $state('')
  let path = $state('')
  let description = $state('')
  let isPublic = $state(false)
  let webhookUrl = $state('')
  let projectId = $state<number | ''>('', )
  let { store } = $props()

  onMount(async () => {
    loading = true
    const [repoResponse, projectResponse] = await Promise.all([
      store.git.fetchAll(),
      store.project.fetchAll(1, 1000),
    ])
    if (!repoResponse.ok) {
      notification.error(repoResponse.statusText)
    }
    if (!projectResponse.ok) {
      notification.error(projectResponse.statusText)
    } else if (projectResponse.data.length > 0 && projectId === '') {
      projectId = projectResponse.data[0].id
    }
    loading = false
  })

  async function fetchPrevious() {
    const response = await store.git.fetchAll(store.git.list.page - 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.git.fetchAll(store.git.list.page + 1)
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
    if (projectId === '') {
      notification.error('Please select a project')
      return
    }
    const response = await store.git.create({
      name,
      path,
      project_id: projectId,
      description: description || undefined,
      public: isPublic,
      webhook_url: webhookUrl || undefined,
    })
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      name = ''
      path = ''
      description = ''
      isPublic = false
      webhookUrl = ''
      projectId = store.project.list.data[0]?.id ?? ''
      showCreate = false
    }
  }

  async function destroy(id: number) {
    const response = await store.git.destroy(id)
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
        <h2>Git Repositories</h2>
        <button class="button primary" onclick={toggleShowCreate}>Create</button>
      </div>
      <div class="table">
        <div class="heading">ID</div>
        <div class="heading">Name</div>
        <div class="heading">Path</div>
        <div class="heading">Actions</div>
        {#each store.git.list.data as repo (repo.id)}
          <div class="data">{repo.id}</div>
          <div class="data">
            <a href={`/git/${repo.id}`}>{repo.name}</a>
          </div>
          <div class="data">{repo.path}</div>
          <div class="data">
            <button class="button error" onclick={() => destroy(repo.id)}>Delete</button>
          </div>
          <div class="border"></div>
        {/each}
      </div>
    </div>
    <div class="actions">
      <button class="button" disabled={store.git.list.page === 1} onclick={fetchPrevious}>&lt;</button>
      {store.git.list.page}
      <button class="button" disabled={store.git.list.page >= store.git.list.pages} onclick={fetchNext}>&gt;</button>
    </div>
  </div>
{/if}

<Modal open={showCreate}>
  <h2>Create Repository</h2>
  <form onsubmit={create}>
    <Input bind:value={name} autofocus required type="text" name="name" label="Name" />
    <Input bind:value={path} required type="text" name="path" label="Path" />
    <label class="select-label" for="project">Project</label>
    <select id="project" bind:value={projectId} required>
      <option value="" disabled>Select project</option>
      {#each store.project.list.data as project (project.id)}
        <option value={project.id}>{project.name}</option>
      {/each}
    </select>
    <Input bind:value={description} type="text" name="description" label="Description" />
    <Input bind:value={webhookUrl} type="url" name="webhook_url" label="Webhook URL" />
    <label class="checkbox-label">
      <input type="checkbox" bind:checked={isPublic} />
      Public
    </label>
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

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .select-label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 600;
    color: var(--color-grey);
  }

  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-lightGrey);
    border-radius: 4px;
    background: var(--bg-color);
    color: var(--font-color);
    font-size: 1rem;
    margin-bottom: 1rem;
  }
</style>
