<script lang="ts">
  import store from '$lib/store'
</script>

<div class="root">
  <button class="button" on:click={store.auth.logout}>Logout</button>
</div>

