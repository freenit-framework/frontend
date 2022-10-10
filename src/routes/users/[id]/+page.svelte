<script lang="ts">
  import User from '$lib/User.svelte'
  import { page } from '$app/stores'
</script>

<User pk={Number($page.params.id)} />
