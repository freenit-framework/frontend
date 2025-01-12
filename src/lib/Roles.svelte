<script lang="ts">
  import { onMount } from 'svelte'
  import Modal from '$lib/Modal.svelte'
  import { error } from '$lib/notification'
  import { store } from '$lib/store'
  import Spinner from './Spinner.svelte'

  let loading = true
  let showCreate = false
  let name = ''

  onMount(async () => {
    loading = true
    const response = await store.role.list.fetch()
    if (!response.ok) {
      error(response.statusText)
    }
    loading = false
  })

  async function fetchPrevious() {
    const response = await store.role.list.fetch(store.role.list.page - 1)
    if (!response.ok) {
      error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.role.list.fetch(store.role.list.page + 1)
    if (!response.ok) {
      error(response.statusText)
    }
  }

  function toggleShowCreate() {
    showCreate = !showCreate
  }

  async function create() {
    const response = await store.role.list.create({ name })
    if (!response.ok) {
      error(response.statusText)
    }
    name = ''
    showCreate = false
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="root">
    <div class="container">
      <div class="header">
        <h2>Roles</h2>
        <button class="button primary" on:click={toggleShowCreate}>Create</button>
      </div>
      <div class="table">
        <div class="heading">ID</div>
        <div class="heading">Name</div>
        {#each store.role.list.data as role}
          <div class="data">
            <a href={`/roles/${role.id || role.dn}`}>{role.id || role.dn}</a>
          </div>
          <div class="data">
            <a href={`/roles/${role.id || role.dn}`}>{role.name || role.cn}</a>
          </div>
          <div class="border"></div>
        {/each}
      </div>
    </div>
    <div class="actions">
      <button class="button" disabled={store.role.list.page === 1} on:click={fetchPrevious}>&lt;</button>
      {store.role.list.page}
      <button class="button" disabled={store.role.list.page >= store.role.list.pages} on:click={fetchNext}>&gt;</button>
    </div>
  </div>
{/if}

<Modal open={showCreate}>
  <h2>Create</h2>
  <form on:submit|preventDefault={create}>
    <!-- svelte-ignore a11y-autofocus -->
    <input bind:value={name} autofocus />
    <div class="actions">
      <button class="button primary" type="submit">Create</button>
      <button class="button error" on:click={toggleShowCreate}>Close</button>
    </div>
  </form>
</Modal>

<style>
  .table {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(2, auto);
  }

  .heading {
    font-weight: bold;
    background-color: #eee;
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
    grid-column: 1 / 3;
    border-top: 1px solid #eee;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>

