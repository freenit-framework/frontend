<script lang="ts">
  import Domain from '$lib/Domain.svelte'
  import store from '$lib/store'

  let { data: props } = $props()
</script>

<Domain fqdn={props.fqdn} store={store} />
