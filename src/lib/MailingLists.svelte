<script lang="ts">
  import { onMount } from 'svelte'
  import Modal from '$lib/Modal.svelte'
  import { notification } from '$lib'
  import Input from './Input.svelte'
  import Spinner from './Spinner.svelte'

  let loading = $state(true)
  let showCreate = $state(false)
  let name = $state('')
  let domain = $state('')
  let description = $state('')
  let { store } = $props()

  onMount(async () => {
    loading = true
    const [listResponse, domainResponse] = await Promise.all([
      store.mailinglist.fetchAll(),
      store.mailinglist.fetchDomains(),
    ])
    if (!listResponse.ok) {
      notification.error(listResponse.statusText)
    }
    if (!domainResponse.ok) {
      notification.error(domainResponse.statusText)
    }
    loading = false
  })

  async function fetchPrevious() {
    const response = await store.mailinglist.fetchAll(store.mailinglist.list.page - 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.mailinglist.fetchAll(store.mailinglist.list.page + 1)
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
    const response = await store.mailinglist.create({
      name,
      domain,
      description: description || undefined,
    })
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      name = ''
      domain = ''
      description = ''
      showCreate = false
    }
  }

  async function destroy(id: number) {
    const response = await store.mailinglist.destroy(id)
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
        <h2>Mailing Lists</h2>
        <button class="button primary" onclick={toggleShowCreate}>Create</button>
      </div>
      <div class="table">
        <div class="heading">ID</div>
        <div class="heading">Name</div>
        <div class="heading">Address</div>
        <div class="heading">Actions</div>
        {#each store.mailinglist.list.data as list (list.id)}
          <div class="data">{list.id}</div>
          <div class="data">
            <a href={`/mailinglists/${list.id}`}>{list.name}</a>
          </div>
          <div class="data">{list.address}</div>
          <div class="data">
            <button class="button error" onclick={() => destroy(list.id)}>Delete</button>
          </div>
          <div class="border"></div>
        {/each}
      </div>
    </div>
    <div class="actions">
      <button class="button" disabled={store.mailinglist.list.page === 1} onclick={fetchPrevious}>&lt;</button>
      {store.mailinglist.list.page}
      <button class="button" disabled={store.mailinglist.list.page >= store.mailinglist.list.pages} onclick={fetchNext}>&gt;</button>
    </div>
  </div>
{/if}

<Modal open={showCreate}>
  <h2>Create Mailing List</h2>
  <form onsubmit={create}>
    <Input bind:value={name} autofocus required type="text" name="name" label="Name" />
    <label class="domain-label" for="domain">Domain</label>
    <select id="domain" bind:value={domain} required>
      <option value="" disabled>Select domain</option>
      {#each store.mailinglist.domains as d (d)}
        <option value={d}>{d}</option>
      {/each}
    </select>
    <Input bind:value={description} type="text" name="description" label="Description" />
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

  .domain-label {
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
