<script lang="ts">
  import Groups from '$lib/Groups.svelte'
  import store from '$lib/store'

  let { data: props } = $props()
</script>

<Groups fqdn={props.fqdn} store={store} />
