<script lang="ts">
  import { onMount } from 'svelte'
  import { notification } from '$lib'
  import Spinner from './Spinner.svelte'

  let loading = $state(true)
  let { store, slug } = $props()

  onMount(async () => {
    loading = true
    const response = await store.blog.fetchPublicPost(slug)
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
    <article class="card">
      <h2>{store.blog.publicDetail.title}</h2>
      <p class="meta">
        {store.blog.publicDetail.date
          ? new Date(store.blog.publicDetail.date).toLocaleDateString()
          : ''}
        {#if store.blog.publicDetail.tags?.length}
          &mdash;
          {#each store.blog.publicDetail.tags as tag (tag)}
            <a class="tag" href={`/blog/tags/${tag}`}>#{tag}</a>
          {/each}
        {/if}
      </p>
      <div class="content">{store.blog.publicDetail.content}</div>
    </article>
    <p><a href="/blog">Back to blog</a></p>
  </div>
{/if}

<style>
  .card {
    border: 1px solid var(--color-lightGrey);
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 20px;
  }

  .meta {
    color: var(--color-grey);
    font-size: 0.9em;
    margin-bottom: 15px;
  }

  .tag {
    margin-right: 8px;
  }

  .content {
    white-space: pre-wrap;
  }
</style>
