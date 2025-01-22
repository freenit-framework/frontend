<script lang="ts">
  import User from '$lib/User.svelte'
  import { page } from '$app/stores'
  import store from '$lib/store'
</script>

<User pk={$page.params.id} store={store} />
