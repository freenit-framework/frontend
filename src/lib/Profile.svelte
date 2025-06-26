<script lang="ts">
  import { onMount } from 'svelte'
  import { utils } from '$lib'

  let { store } = $props()

  onMount(async () => {
    store.user.fetchProfile()
  })
</script>

<div class="root">
  <div>ID: {utils.id(store.user.profile)}</div>
  <div>Email: {store.user.profile.email}</div>
  <div>
    Active: {store.user.profile.active ? 'yes' : 'no'}
  </div>
  <div>Admin: {store.user.profile.admin ? 'yes' : 'no'}</div>
</div>

<style>
  .root {
    height: 100vh;
  }
</style>
