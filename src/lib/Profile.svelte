<script lang="ts">
  import { onMount } from 'svelte'

  let { store } = $props()

  onMount(async () => {
    store.user.fetchProfile()
  })
</script>

<div class="root">
  <div>ID: {store.user.profile.id || store.user.profile.dn}</div>
  <div>Email: {store.user.profile.email}</div>
  <div>Active: {store.user.profile.active || store.user.profile.userClass == 'enabled' ? 'yes' : 'no'}</div>
  <div>Admin: {store.user.profile.admin ? 'yes' : 'no'}</div>
</div>

<style>
  .root {
    height: 100vh;
  }
</style>
