<script lang="ts">
  import { onMount } from 'svelte'
  import Modal from '$lib/Modal.svelte'
  import { notification, utils } from '$lib'
  import Input from './Input.svelte'
  import Spinner from './Spinner.svelte'

  let loading = $state(true)
  let showCreate = $state(false)
  let name = $state('')
  let { store } = $props()

  onMount(async () => {
    loading = true
    const response = await store.domain.fetchAll()
    if (!response.ok) {
      notification.nerror(response.statusText)
    }
    loading = false
  })

  async function fetchPrevious() {
    const response = await store.domain.fetchAll(store.domain.list.page - 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.domain.fetchAll(store.domain.list.page + 1)
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
    const response = await store.domain.create({ name })
    if (!response.ok) {
      notification.error(response.statusText)
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
        <h2>Domains</h2>
        <button class="button primary" onclick={toggleShowCreate}>Create</button>
      </div>
      <div class="table">
        <div class="heading">FQDN</div>
        {#each store.domain.list.data as domain}
          <div class="data">
            <a href={`/domains/${domain.ou}`}>{domain.ou}</a>
          </div>
          <div class="data">
            <a href={`/domains/${utils.name(domain)}`}>{utils.name(domain)}</a>
          </div>
          <div class="border"></div>
        {/each}
      </div>
    </div>
    <div class="actions">
      <button class="button" disabled={store.domain.list.page === 1} onclick={fetchPrevious}>&lt;</button>
      {store.domain.list.page}
      <button class="button" disabled={store.domain.list.page >= store.domain.list.pages} onclick={fetchNext}>&gt;</button>
    </div>
  </div>
{/if}

<Modal open={showCreate}>
  <h2>Create</h2>
  <form onsubmit={create}>
    <Input bind:value={name} autofocus type="text" name="name" label="Name" />
    <div class="actions">
      <button class="button primary" type="submit">Create</button>
      <button class="button error" onclick={toggleShowCreate}>Close</button>
    </div>
  </form>
</Modal>

<style>
  .table {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    display: flex;
    flex-direction: column;
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

