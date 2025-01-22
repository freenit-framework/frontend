<script lang="ts">
  import Theme from '$lib/Theme.svelte'
  import { page } from '$app/stores'
  import store from '$lib/store'
</script>

<Theme name={$page.params.name} store={store} />
