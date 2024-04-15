<script lang="ts">
  import { onMount } from 'svelte'
  import store from '$lib/store'
  import { error } from '$lib/notification'

  const { profile } = store().user
  onMount(async () => {
    const response = await profile.fetch()
    if (!response.ok) {
      error(response.statusText)
    }
  })
</script>

<div>
  <div>ID: {$profile.id || $profile.dn}</div>
  <div>Email: {$profile.email}</div>
  <div>Active: {$profile.active || $profile.userClass == 'enabled' ? 'yes' : 'no'}</div>
  <div>Admin: {$profile.admin ? 'yes' : 'no'}</div>
</div>
