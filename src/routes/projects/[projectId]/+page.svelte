<script lang="ts">
  import Boards from '$lib/Boards.svelte'
  import store from '$lib/store'

  let { data: props } = $props()
</script>

<Boards projectId={props.projectId} store={store} />
