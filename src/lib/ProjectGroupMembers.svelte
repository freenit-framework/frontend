<script lang="ts">
  import { onMount } from 'svelte'
  import Spinner from './Spinner.svelte'
  import { notification } from '$lib'

  let { projectId, groupId, store } = $props()
  let loading = $state(true)

  onMount(async () => {
    const [groupResponse, membersResponse, usersResponse] = await Promise.all([
      store.project.fetchGroup(groupId),
      store.project.fetchGroupMembers(groupId),
      store.user.fetchAll(),
    ])
    if (!groupResponse.ok) {
      notification.error(groupResponse.statusText)
    }
    if (!membersResponse.ok) {
      notification.error(membersResponse.statusText)
    }
    if (!usersResponse.ok) {
      notification.error(usersResponse.statusText)
    }
    loading = false
  })

  async function fetchPrevious() {
    const response = await store.project.fetchGroupMembers(
      groupId,
      store.user.list.page - 1,
    )
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.project.fetchGroupMembers(
      groupId,
      store.user.list.page + 1,
    )
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  function isMember(userId: number) {
    return store.project.groupMembers.some((member: any) => member.user_id === userId)
  }

  async function toggleMember(user: any, event: Event) {
    const target = event.target as HTMLInputElement
    let response
    if (target.checked) {
      response = await store.project.addGroupMember(groupId, user.id)
    } else {
      response = await store.project.removeGroupMember(groupId, user.id)
    }
    if (!response.ok) {
      notification.error(response.statusText)
      target.checked = !target.checked
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <div class="header">
      <div>
        <h2>{store.project.groupDetail.name}</h2>
        <p>{store.project.groupDetail.description || ''}</p>
      </div>
      <a class="button" href={`/projects/${projectId}/groups`}>Back to Groups</a>
    </div>
    <h3>Members</h3>
    <div class="table">
      <div class="heading">Name</div>
      <div class="heading">Email</div>
      <div class="heading">Member</div>
      {#each store.user.list.data as user (user.id)}
        <div class="data">{user.fullname || user.email}</div>
        <div class="data">{user.email}</div>
        <div class="data">
          <input type="checkbox" checked={isMember(user.id)} onchange={(e) => toggleMember(user, e)} />
        </div>
        <div class="border"></div>
      {/each}
    </div>
    <div class="actions">
      <button class="button" disabled={store.user.list.page === 1} onclick={fetchPrevious}>
        &lt;
      </button>
      {store.user.list.page}
      <button
        class="button"
        disabled={store.user.list.page >= store.user.list.pages}
        onclick={fetchNext}
      >
        &gt;
      </button>
    </div>
  </div>
{/if}

<style>
  .table {
    border: 1px solid var(--color-lightGrey);
    border-radius: 5px;
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(3, auto);
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
    grid-column: 1 / 4;
    border-top: 1px solid var(--color-lightGrey);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
