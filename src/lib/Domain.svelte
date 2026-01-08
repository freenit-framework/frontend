<script lang="ts">
  import { onMount } from 'svelte'
  import { notification, utils, Modal } from '$lib'
  import Input from './Input.svelte'
  import Spinner from './Spinner.svelte'

  let loading = $state(true)
  let { fqdn, store } = $props()
  let name = $state('')
  let showCreate = $state(false)
  let showDestroy = $state(false)
  let groupToDestroy

  onMount(async () => {
    loading = true
    const [domainResponse, groupResponse] = await Promise.all([
      store.domain.fetch(fqdn),
      store.group.fetchAll(fqdn),
    ])
    if (!domainResponse.ok) {
      notification.error(domainResponse.statusText)
    }
    if (!groupResponse.ok) {
      notification.error(groupResponse.statusText)
    }
    loading = false
  })

  const fetchPrevious = async () => {
    const response = await store.group.fetchAll(store.group.list.page - 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  const fetchNext = async () => {
    const response = await store.group.fetchAll(store.group.list.page + 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  function toggleShowCreate(event: Event) {
    event.preventDefault()
    showCreate = !showCreate
  }

  const toggleShowDestroy = (group) => (event: Event) => {
    event.preventDefault()
    showDestroy = !showDestroy
    if (showDestroy) {
      groupToDestroy = group
    } else {
      groupToDestroy = null
    }
  }

  async function create(event: Event) {
    event.preventDefault()
    const response = await store.group.create(fqdn, { name })
    if (!response.ok) {
      notification.error(response.statusText)
    }
    name = ''
    showCreate = false
  }

  async function destroy(event: Event) {
    event.preventDefault()
    console.log(groupToDestroy)
    const response = await store.group.destroy(fqdn, groupToDestroy.cn)
    if (!response.ok) {
      notification.error(response.statusText)
    }
    groupToDestroy = null
    showDestroy = false
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>Domain: {fqdn}</h2>
    <div class="header">
      <h2>Groups</h2>
      <button class="button primary" onclick={toggleShowCreate}>Create</button>
    </div>
    <div class="table">
      <div class="heading">Name</div>
      {#each store.group.list.data as group}
        <div class="group">
          <a class="data" href={`/domains/${fqdn}/${group.cn}`}>{group.cn}</a>
          <button class="button error" onclick={toggleShowDestroy(group)}>Destroy</button>
        </div>
        <div class="border"></div>
      {/each}
    </div>
  </div>
  <div class="actions">
    <button class="button" disabled={store.group.list.page <= 1} onclick={fetchPrevious}
      >&lt;</button
    >
    {store.group.list.page}
    <button
      class="button"
      disabled={store.group.list.total === 0 || store.group.list.page === store.group.list.pages}
      onclick={fetchNext}>&gt;</button
    >
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

<Modal open={showDestroy}>
  <h2>Destroy</h2>
  <form onsubmit={destroy}>
    <div class="actions">
      <button class="button primary" type="submit">destroy</button>
      <button class="button error" onclick={toggleShowDestroy(null)}>Close</button>
    </div>
  </form>
</Modal>

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

  .group {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
