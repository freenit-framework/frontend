<script lang="ts">
  import { onMount } from 'svelte'
  import Modal from '$lib/Modal.svelte'
  import Input from './Input.svelte'
  import Lectures from './Lectures.svelte'
  import Spinner from './Spinner.svelte'
  import { notification } from '$lib'

  const availablePermissions = ['view', 'edit']

  let { courseId, store } = $props()
  let loading = $state(true)
  let showCreateGroup = $state(false)
  let groupName = $state('')
  let groupDescription = $state('')
  let selectedPermissions = $state<string[]>([])

  onMount(async () => {
    const [courseResponse, groupsResponse] = await Promise.all([
      store.lms.fetch(courseId),
      store.lms.fetchGroups(courseId),
    ])
    if (!courseResponse.ok) {
      notification.error(courseResponse.statusText)
    }
    if (!groupsResponse.ok) {
      notification.error(groupsResponse.statusText)
    }
    loading = false
  })

  function toggleShowCreateGroup(event: Event) {
    event.preventDefault()
    showCreateGroup = !showCreateGroup
    if (!showCreateGroup) {
      resetGroupForm()
    }
  }

  function resetGroupForm() {
    groupName = ''
    groupDescription = ''
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

  async function createGroup(event: Event) {
    event.preventDefault()
    const response = await store.lms.createGroup(courseId, {
      name: groupName,
      description: groupDescription || undefined,
      permissions: selectedPermissions,
    })
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      resetGroupForm()
      showCreateGroup = false
    }
  }

  async function destroyGroup(id: number) {
    const response = await store.lms.destroyGroup(id)
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
      <div>
        <h2>{store.lms.detail.name}</h2>
        <p>{store.lms.detail.description || ''}</p>
      </div>
      <a class="button" href="/courses">Back to Courses</a>
    </div>

    <Lectures {courseId} {store} />

    <div class="groups">
      <div class="header">
        <h3>Groups</h3>
        <button class="button primary" onclick={toggleShowCreateGroup}>Add Group</button>
      </div>
      {#if store.lms.groups.length === 0}
        <p>No groups yet.</p>
      {:else}
        <div class="table">
          <div class="heading">ID</div>
          <div class="heading">Name</div>
          <div class="heading">Description</div>
          <div class="heading">Actions</div>
          {#each store.lms.groups as group (group.id)}
            <div class="data">{group.id}</div>
            <div class="data">
              {group.name}
              {#if group.permissions?.length > 0}
                <div class="permissions">{group.permissions.join(', ')}</div>
              {/if}
            </div>
            <div class="data">{group.description || ''}</div>
            <div class="data">
              <a class="button" href={`/courses/${courseId}/groups/${group.id}/members`}>Members</a>
              <button class="button error" onclick={() => destroyGroup(group.id)}>Delete</button>
            </div>
            <div class="border"></div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<Modal open={showCreateGroup}>
  <h2>Add Group</h2>
  <form onsubmit={createGroup}>
    <Input bind:value={groupName} autofocus required type="text" name="name" label="Name" />
    <Input bind:value={groupDescription} type="text" name="description" label="Description" />
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
      <button class="button primary" type="submit">Add</button>
      <button class="button error" onclick={toggleShowCreateGroup} type="button">Close</button>
    </div>
  </form>
</Modal>

<style>
  .container {
    padding: 10px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .groups {
    margin-top: 30px;
  }

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

  .border {
    grid-column: 1 / 5;
    border-top: 1px solid var(--color-lightGrey);
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
