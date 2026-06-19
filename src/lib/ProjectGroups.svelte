<script lang="ts">
  import { onMount } from 'svelte'
  import Modal from '$lib/Modal.svelte'
  import Input from './Input.svelte'
  import Spinner from './Spinner.svelte'
  import { notification } from '$lib'

  const availablePermissions = [
    'create_project',
    'delete_project',
    'rename_project',
    'create_board',
    'delete_board',
    'rename_board',
    'create_column',
    'delete_column',
    'rename_column',
  ]

  let { projectId, store } = $props()
  let loading = $state(true)
  let showCreate = $state(false)
  let name = $state('')
  let description = $state('')
  let selectedPermissions = $state<string[]>([])

  onMount(async () => {
    const [projectResponse, groupsResponse] = await Promise.all([
      store.project.fetch(projectId),
      store.project.fetchGroups(projectId),
    ])
    if (!projectResponse.ok) {
      notification.error(projectResponse.statusText)
    }
    if (!groupsResponse.ok) {
      notification.error(groupsResponse.statusText)
    }
    loading = false
  })

  async function fetchPrevious() {
    const response = await store.project.fetchGroups(
      projectId,
      store.project.groupList.page - 1,
    )
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.project.fetchGroups(
      projectId,
      store.project.groupList.page + 1,
    )
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  function toggleShowCreate(event: Event) {
    event.preventDefault()
    showCreate = !showCreate
    if (!showCreate) {
      resetForm()
    }
  }

  function resetForm() {
    name = ''
    description = ''
    selectedPermissions = []
  }

  function togglePermission(permission: string, event: Event) {
    const target = event.target as HTMLInputElement
    if (target.checked) {
      selectedPermissions = [...selectedPermissions, permission]
    } else {
      selectedPermissions = selectedPermissions.filter((p) => p !== permission)
    }
  }

  async function create(event: Event) {
    event.preventDefault()
    const response = await store.project.createGroup(projectId, {
      name,
      description: description || undefined,
      permissions: selectedPermissions,
    })
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      resetForm()
      showCreate = false
    }
  }

  async function destroy(id: number) {
    const response = await store.project.destroyGroup(id)
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
        <button class="button primary" onclick={toggleShowCreate}>Create Group</button>
      </div>
      <div class="table">
        <div class="heading">ID</div>
        <div class="heading">Name</div>
        <div class="heading">Description</div>
        <div class="heading">Actions</div>
        {#each store.project.groupList.data as group (group.id)}
          <div class="data">{group.id}</div>
          <div class="data">
            <a href={`/projects/${projectId}/groups/${group.id}`}>{group.name}</a>
            {#if group.permissions?.length > 0}
              <div class="permissions">{group.permissions.join(', ')}</div>
            {/if}
          </div>
          <div class="data">{group.description || ''}</div>
          <div class="data">
            <a class="button" href={`/projects/${projectId}/groups/${group.id}/members`}>Members</a>
            <button class="button error" onclick={() => destroy(group.id)}>Delete</button>
          </div>
          <div class="border"></div>
        {/each}
      </div>
    </div>
    <div class="actions">
      <button
        class="button"
        disabled={store.project.groupList.page === 1}
        onclick={fetchPrevious}
      >
        &lt;
      </button>
      {store.project.groupList.page}
      <button
        class="button"
        disabled={store.project.groupList.page >= store.project.groupList.pages}
        onclick={fetchNext}
      >
        &gt;
      </button>
    </div>
  </div>
{/if}

<Modal open={showCreate}>
  <h2>Create Group</h2>
  <form onsubmit={create}>
    <Input bind:value={name} autofocus required type="text" name="name" label="Name" />
    <Input bind:value={description} type="text" name="description" label="Description" />
    <div class="permissions-section">
      <span class="label">Permissions</span>
      <div class="permission-list">
        {#each availablePermissions as permission (permission)}
          <label class="permission-item">
            <input
              type="checkbox"
              checked={selectedPermissions.includes(permission)}
              onchange={(e) => togglePermission(permission, e)}
            />
            {permission}
          </label>
        {/each}
      </div>
    </div>
    <div class="actions">
      <button class="button primary" type="submit">Create</button>
      <button class="button error" onclick={toggleShowCreate} type="button">Close</button>
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

  .permissions {
    font-size: 0.75rem;
    color: var(--color-grey);
    margin-top: 4px;
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

  .permissions-section {
    margin-top: 20px;
  }

  .permissions-section .label {
    font-size: 0.875rem;
    color: var(--color-grey);
  }

  .permission-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 8px;
  }

  .permission-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
  }

  .permission-item input {
    margin: 0;
  }
</style>
