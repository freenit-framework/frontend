<script lang="ts">
  import Theme from '$lib/Theme.svelte'
  import store from '$lib/store'

  let { data: props } = $props()
</script>

<Theme name={props.name} store={store} />
