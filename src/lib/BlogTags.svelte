<script lang="ts">
  import { onMount } from 'svelte'
  import { notification } from '$lib'
  import Spinner from './Spinner.svelte'

  let loading = $state(true)
  let { store } = $props()

  onMount(async () => {
    loading = true
    const response = await store.blog.fetchTags()
    if (!response.ok) {
      notification.error(response.statusText)
    }
    loading = false
  })
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>Tags</h2>
    <div class="tags">
      {#each store.blog.tagList as tag (tag.id)}
        <a class="tag button" href={`/blog/tags/${tag.name}`}>#{tag.name}</a>
      {/each}
    </div>
    <p><a href="/blog">Back to blog</a></p>
  </div>
{/if}

<style>
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
  }

  .tag {
    text-decoration: none;
  }
</style>
