<script lang="ts">
  import Group from '$lib/Group.svelte'
  import store from '$lib/store'

  let { data: props } = $props()
</script>

<Group fqdn={props.fqdn} name={props.name} store={store} />
