<script lang="ts">
  import Role from '$lib/Role.svelte'
  import { page } from '$app/stores'
  import store from '$lib/store'
</script>

<Role pk={$page.params.id} store={store} />
