<script lang="ts">
  import Role from '$lib/Role.svelte'
  import store from '$lib/store'

  let { data: props } = $props()
</script>

<Role pk={props.pk} store={store} />
