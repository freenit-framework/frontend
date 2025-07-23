<script lang="ts">
  import { onMount } from 'svelte'
  import { notification, utils } from '$lib'
  import Spinner from './Spinner.svelte'

  let loading = $state(true)
  let { store } = $props()

  onMount(async () => {
    const response = await store.user.fetchAll()
    if (!response.ok) {
      notification.error(response.statusText)
    }
    loading = false
  })

  const fetchPrevious = async () => {
    const response = await store.user.fetchAll(store.user.list.page - 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  const fetchNext = async () => {
    const response = await store.user.fetchAll(store.user.list.page + 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  const toggleActive = (user) => async () => {
    const response = await store.user.edit(utils.uid(user), { active: !user.active })
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  const toggleAdmin = (user) => async () => {
    const response = await store.user.edit(utils.uid(user), { admin: !user.admin })
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>Users</h2>
    <div class="table">
      <div class="heading">ID</div>
      <div class="heading">EMail</div>
      <div class="heading">Active</div>
      <div class="heading">Admin</div>
      {#each store.user.list.data as user}
        <div class="data">{utils.uid(user)}</div>
        <div class="data">
          <a href={`/users/${utils.uid(user)}`}>{user.email}</a>
        </div>
        <div class="data">
          <input type="checkbox" checked={user.active} onclick={toggleActive(user)} />
        </div>
        <div class="data">
          <input type="checkbox" checked={user.admin} onclick={toggleAdmin(user)} />
        </div>
        <div class="border"></div>
      {/each}
    </div>
  </div>
  <div class="actions">
    <button class="button" disabled={store.user.list.page === 1} onclick={fetchPrevious}
      >&lt;</button
    >
    {store.user.list.page}
    <button
      class="button"
      disabled={store.user.list.page >= store.user.list.pages}
      onclick={fetchNext}>&gt;</button
    >
  </div>
{/if}

<style>
  .table {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(4, auto);
  }

  .heading {
    font-weight: bold;
    background-color: #eee;
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
    border-top: 1px solid #eee;
  }
</style>
