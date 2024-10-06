<script lang="ts">
  import { onMount } from 'svelte'
  import store from '$lib/store'
  import Modal from '$lib/Modal.svelte'
  import { error } from '$lib/notification'
  import Spinner from './Spinner.svelte'

  let showCreate = false
  let name = ''
  let loading = true
  const { list } = store().theme

  onMount(async () => {
    loading = true
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

  function toggleShowCreate() {
    showCreate = !showCreate
  }

  async function create() {
    const response = await list.create({ name })
    if (!response.ok) {
      error(response.statusText)
    } else {
      $list.data = [...$list.data, response]
      console.log($list)
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
        <h2>Themes</h2>
        <button class="button primary" on:click={toggleShowCreate}>Create</button>
      </div>
      <div class="table">
        <div class="heading">ID</div>
        <div class="heading">Name</div>
        {#each $list.data as theme}
          <div class="data">
            <a href={`/themes/${theme.name}`}>{theme.id}</a>
          </div>
          <div class="data">
            <a href={`/themes/${theme.name}`}>{theme.name}</a>
          </div>
          <div class="border" />
        {/each}
      </div>
    </div>
    <div class="actions">
      <button class="button" disabled={$list.page === 1} on:click={fetchPrevious}>&lt;</button>
      {$list.page}
      <button class="button" disabled={$list.page >= $list.pages} on:click={fetchNext}>&gt;</button>
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

  .data {
    padding: 5px;
  }
</style>
