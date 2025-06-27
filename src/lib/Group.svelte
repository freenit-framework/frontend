<script lang="ts">
  import { onMount } from 'svelte'
  import { notification, utils } from '$lib'
  import Spinner from './Spinner.svelte'

  let loading = $state(true)
  let { fqdn, name, store } = $props()

  onMount(async () => {
    loading = true
    const [groupResponse, userResponse] = await Promise.all([
      store.group.fetch(fqdn),
      store.user.fetchAll(),
    ])
    if (!groupResponse.ok) {
      notification.error(groupResponse.statusText)
    }
    if (!userResponse.ok) {
      notification.error(userResponse.statusText)
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
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>Group: {fqdn}/{name}</h2>
    <h3>Users</h3>
    <div class="table">
      <div class="heading">Name</div>
      {#each store.user.list.data as user}
        <a class="data" href={`/users/${user.cn}`}>{user.cn}</a>
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
      disabled={store.user.list.total === 0 || store.user.list.page === store.user.list.pages}
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
    grid-template-columns: repeat(1, auto);
  }

  .heading {
    font-weight: bold;
    background-color: #eee;
    padding: 5px;
  }

  .data {
    padding: 5px;
  }

  .border {
    grid-column: 1 / 2;
    border-top: 1px solid #eee;
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
</style>
