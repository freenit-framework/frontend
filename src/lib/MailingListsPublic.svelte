<script lang="ts">
  import { onMount } from 'svelte'
  import { notification } from '$lib'
  import Spinner from './Spinner.svelte'
  import Input from './Input.svelte'

  let loading = $state(true)
  let email = $state('')
  let selectedList: any = $state(null)
  let { store } = $props()

  onMount(async () => {
    loading = true
    const response = await store.mailinglist.fetchPublic()
    if (!response.ok) {
      notification.error(response.statusText)
    }
    loading = false
  })

  async function subscribe(event: Event) {
    event.preventDefault()
    if (!selectedList) return
    const response = await store.mailinglist.subscribe(selectedList.id, email)
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      notification.success('Please check your email to confirm subscription')
      email = ''
      selectedList = null
    }
  }

  async function unsubscribe(event: Event) {
    event.preventDefault()
    if (!selectedList) return
    const response = await store.mailinglist.unsubscribe(selectedList.id, email)
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      notification.success('Please check your email to confirm unsubscription')
      email = ''
      selectedList = null
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>Mailing Lists</h2>
    <div class="lists">
      {#each store.mailinglist.publicList.data as list (list.id)}
        <div class="card">
          <h3>{list.name}</h3>
          <p>{list.description || ''}</p>
          <p><a href={`/mailinglists/${list.id}/archive`}>Archive</a></p>
          <button class="button" onclick={() => selectedList = list}>Subscribe / Unsubscribe</button>
        </div>
      {/each}
    </div>
  </div>
{/if}

{#if selectedList}
  <div class="modal">
    <div class="modal-content">
      <h3>{selectedList.name}</h3>
      <Input bind:value={email} type="email" name="email" label="Email" />
      <div class="actions">
        <button class="button primary" onclick={subscribe}>Subscribe</button>
        <button class="button error" onclick={unsubscribe}>Unsubscribe</button>
        <button class="button" onclick={() => selectedList = null}>Close</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .lists {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }

  .card {
    border: 1px solid var(--color-lightGrey);
    border-radius: 5px;
    padding: 15px;
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-content {
    background: var(--bg-color);
    color: var(--font-color);
    padding: 20px;
    border-radius: 5px;
    min-width: 300px;
  }

  .actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
  }
</style>
