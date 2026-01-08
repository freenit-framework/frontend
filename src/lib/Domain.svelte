<script lang="ts">
  import { onMount } from 'svelte'
  import { notification, utils } from '$lib'
  import Spinner from './Spinner.svelte'

  let loading = $state(true)
  let { fqdn, store } = $props()

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
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>Domain: {fqdn}</h2>
    <h3>Groups</h3>
    <div class="table">
      <div class="heading">Name</div>
      {#each store.group.list.data as group}
        <a class="data" href={`/domains/${fqdn}/${group.cn}`}>{group.cn}</a>
        <div class="border"></div>
      {/each}
    </div>
  </div>
  <div class="actions">
    <button class="button" disabled={store.group.list.page === 1} onclick={fetchPrevious}
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
