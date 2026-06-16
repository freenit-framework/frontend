<script lang="ts">
  import { onMount } from 'svelte'
  import { notification } from '$lib'
  import Spinner from './Spinner.svelte'
  import Input from './Input.svelte'

  let loading = $state(true)
  let activeTab = $state('subscribers')
  let { pk = 0, store } = $props()

  onMount(async () => {
    loading = true
    const response = await store.mailinglist.fetch(pk)
    if (!response.ok) {
      notification.error(response.statusText)
    }
    await loadTab(activeTab)
    loading = false
  })

  async function loadTab(tab: string) {
    activeTab = tab
    let response
    switch (tab) {
      case 'subscribers':
        response = await store.mailinglist.fetchSubscribers(pk)
        break
      case 'archive':
        response = await store.mailinglist.fetchArchive(pk)
        break
      case 'moderation':
        response = await store.mailinglist.fetchModeration(pk)
        break
      default:
        return
    }
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function saveSettings(event: Event) {
    event.preventDefault()
    const detail = store.mailinglist.detail
    const response = await store.mailinglist.edit(pk, {
      name: detail.name,
      description: detail.description,
      public: detail.public,
      archive_enabled: detail.archive_enabled,
      moderation_enabled: detail.moderation_enabled,
    })
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      notification.success('Settings saved')
    }
  }

  async function process() {
    const response = await store.mailinglist.process(pk)
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      notification.success(`Processed: ${JSON.stringify(response)}`)
    }
  }

  async function approve(msgId: number) {
    const response = await store.mailinglist.approve(pk, msgId)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function reject(msgId: number) {
    const response = await store.mailinglist.reject(pk, msgId)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>{store.mailinglist.detail.name}</h2>
    <p>{store.mailinglist.detail.address}</p>
    <p>{store.mailinglist.detail.description || ''}</p>

    <div class="tabs">
      <button class="button" class:primary={activeTab === 'subscribers'} onclick={() => loadTab('subscribers')}>Subscribers</button>
      <button class="button" class:primary={activeTab === 'archive'} onclick={() => loadTab('archive')}>Archive</button>
      <button class="button" class:primary={activeTab === 'moderation'} onclick={() => loadTab('moderation')}>Moderation</button>
      <button class="button" class:primary={activeTab === 'settings'} onclick={() => loadTab('settings')}>Settings</button>
    </div>

    {#if activeTab === 'subscribers'}
      <div class="table">
        <div class="heading">Email</div>
        {#each store.mailinglist.subscribers as subscriber (subscriber.email)}
          <div class="data">{subscriber.email}</div>
          <div class="border"></div>
        {/each}
      </div>
    {:else if activeTab === 'archive'}
      <div class="table">
        <div class="heading">Subject</div>
        <div class="heading">Sender</div>
        <div class="heading">Date</div>
        {#each store.mailinglist.archive.data as msg (msg.id)}
          <div class="data">{msg.subject}</div>
          <div class="data">{msg.sender}</div>
          <div class="data">{msg.sent_at}</div>
          <div class="border"></div>
        {/each}
      </div>
    {:else if activeTab === 'moderation'}
      <div class="table">
        <div class="heading">Subject</div>
        <div class="heading">Sender</div>
        <div class="heading">Actions</div>
        {#each store.mailinglist.moderation.data as msg (msg.id)}
          <div class="data">{msg.subject}</div>
          <div class="data">{msg.sender}</div>
          <div class="data">
            <button class="button primary" onclick={() => approve(msg.id)}>Approve</button>
            <button class="button error" onclick={() => reject(msg.id)}>Reject</button>
          </div>
          <div class="border"></div>
        {/each}
      </div>
      <div class="actions">
        <button class="button primary" onclick={process}>Process Inbox</button>
      </div>
    {:else if activeTab === 'settings'}
      <form onsubmit={saveSettings}>
        <Input bind:value={store.mailinglist.detail.name} type="text" name="name" label="Name" />
        <Input bind:value={store.mailinglist.detail.description} type="text" name="description" label="Description" />
        <label>
          <input type="checkbox" bind:checked={store.mailinglist.detail.public} />
          Public
        </label>
        <label>
          <input type="checkbox" bind:checked={store.mailinglist.detail.archive_enabled} />
          Archive enabled
        </label>
        <label>
          <input type="checkbox" bind:checked={store.mailinglist.detail.moderation_enabled} />
          Moderation enabled
        </label>
        <div class="actions">
          <button class="button primary" type="submit">Save</button>
          <button class="button primary" onclick={process} type="button">Process Inbox</button>
        </div>
      </form>
    {/if}
  </div>
{/if}

<style>
  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

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

  label {
    display: block;
    margin: 10px 0;
  }
</style>
