<script lang="ts">
  import Theme from '$lib/Theme.svelte'
  import { page } from '$app/stores'
</script>

<Theme name={$page.params.name} />
