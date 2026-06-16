<script lang="ts">
  import { onMount } from 'svelte'
  import { notification } from '$lib'
  import Spinner from './Spinner.svelte'

  let loading = $state(true)
  let { pk = 0, store } = $props()

  onMount(async () => {
    loading = true
    const response = await store.mailinglist.fetchArchive(pk)
    if (!response.ok) {
      notification.error(response.statusText)
    }
    loading = false
  })

  async function fetchPrevious() {
    const response = await store.mailinglist.fetchArchive(pk, store.mailinglist.archive.page - 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.mailinglist.fetchArchive(pk, store.mailinglist.archive.page + 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>Archive</h2>
    <div class="table">
      <div class="heading">Subject</div>
      <div class="heading">Sender</div>
      <div class="heading">Date</div>
      {#each store.mailinglist.archive.data as msg (msg.id)}
        <div class="data">{msg.subject || '(no subject)'}</div>
        <div class="data">{msg.sender}</div>
        <div class="data">{msg.sent_at}</div>
        <div class="border"></div>
      {/each}
    </div>
    <div class="actions">
      <button class="button" disabled={store.mailinglist.archive.page === 1} onclick={fetchPrevious}>&lt;</button>
      {store.mailinglist.archive.page}
      <button class="button" disabled={store.mailinglist.archive.page >= store.mailinglist.archive.pages} onclick={fetchNext}>&gt;</button>
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

  .border {
    grid-column: 1 / 4;
    border-top: 1px solid var(--color-lightGrey);
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
