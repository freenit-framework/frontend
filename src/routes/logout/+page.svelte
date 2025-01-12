<script lang="ts">
  import store from '$lib/store'

  async function logout() {
    await store().auth.logout()
  }
</script>

<div class="root">
  <button class="button" on:click={logout}>Logout</button>
</div>
