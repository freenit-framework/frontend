<script lang="ts">
  import BlogPostPublic from '$lib/BlogPostPublic.svelte'
  import store from '$lib/store'

  let { data: props } = $props()
</script>

<BlogPostPublic slug={props.slug} store={store} />
