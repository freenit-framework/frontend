<script lang="ts">
  import { onMount } from 'svelte'
  import { error } from '$lib/notification'
  import { store } from '$lib'

  onMount(async () => {
    const response = await store.user.fetchProfile()
    if (!response.ok) {
      error(response.statusText)
    }
  })
</script>

<div>
  <div>ID: {store.user.profile.id || store.user.profile.dn}</div>
  <div>Email: {store.user.profile.email}</div>
  <div>Active: {store.user.profile.active || store.user.profile.userClass == 'enabled' ? 'yes' : 'no'}</div>
  <div>Admin: {store.user.profile.admin ? 'yes' : 'no'}</div>
</div>
