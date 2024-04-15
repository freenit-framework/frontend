<script lang="ts">
  import { onMount } from 'svelte'
  import store from '$lib/store'
  import { error } from '$lib/notification'
  import Spinner from './Spinner.svelte'

  const { detail, list } = store().user
  let loading = true
  onMount(async () => {
    const response = await list.fetch()
    if (!response.ok) {
      error(response.statusText)
    }
    loading = false
  })

  async function fetchPrevious() {
    const response = await list.fetch($list.page - 1)
    if (!response.ok) {
      error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await list.fetch($list.page + 1)
    if (!response.ok) {
      error(response.statusText)
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
      {#each $list.data as user}
        <div class="data">{user.id || user.dn}</div>
        <div class="data">
          <a href={`/users/${user.id || user.dn}`}>{user.email}</a>
        </div>
        <div class="data">
          <input
            disabled
            type="checkbox"
            checked={user.active || user.userClass == 'enabled'}
          />
        </div>
        <div class="data">
          <input
            disabled={!$detail.admin}
            type="checkbox"
            checked={user.admin}
          />
        </div>
        <div class="border" />
      {/each}
    </div>
  </div>
  <div class="actions">
    <button class="button" disabled={$list.page === 1} on:click={fetchPrevious}
      >&lt;</button
    >
    {$list.page}
    <button
      class="button"
      disabled={$list.page >= $list.pages}
      on:click={fetchNext}>&gt;</button
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
