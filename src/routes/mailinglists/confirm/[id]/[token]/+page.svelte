<script lang="ts">
  import { onMount } from 'svelte'
  import { notification } from '$lib'
  import store from '$lib/store'
  import Spinner from '$lib/Spinner.svelte'

  let { data }: any = $props()
  let loading = $state(true)
  let message = $state('')

  onMount(async () => {
    const response = await store.mailinglist.confirm(Number(data.id), data.token)
    loading = false
    if (response.ok) {
      message = 'Your subscription has been confirmed.'
      notification.success(message)
    } else {
      message = 'Invalid or expired confirmation link.'
      notification.error(response.statusText)
    }
  })
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>Subscription Confirmation</h2>
    <p>{message}</p>
  </div>
{/if}
