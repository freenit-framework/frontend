<script lang="ts">
  import BlogTagPosts from '$lib/BlogTagPosts.svelte'
  import store from '$lib/store'

  let { data: props } = $props()
</script>

<BlogTagPosts name={props.name} store={store} />
