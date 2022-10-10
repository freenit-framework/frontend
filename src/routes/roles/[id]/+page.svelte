<script lang="ts">
  import Role from '$lib/Role.svelte'
  import { page } from '$app/stores'
</script>

<Role pk={Number($page.params.id)} />
