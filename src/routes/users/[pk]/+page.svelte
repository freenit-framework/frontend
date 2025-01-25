<script lang="ts">
  import User from '$lib/User.svelte'
  import store from '$lib/store'

  let { data: props } = $props()
</script>

<User pk={props.pk} store={store} />
