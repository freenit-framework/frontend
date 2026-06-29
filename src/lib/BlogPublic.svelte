<script lang="ts">
  import { onMount } from 'svelte'
  import { notification } from '$lib'
  import Spinner from './Spinner.svelte'

  let loading = $state(true)
  let { store } = $props()

  onMount(async () => {
    loading = true
    const response = await store.blog.fetchPublic()
    if (!response.ok) {
      notification.error(response.statusText)
    }
    loading = false
  })

  async function fetchPrevious() {
    const response = await store.blog.fetchPublic(store.blog.publicList.page - 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.blog.fetchPublic(store.blog.publicList.page + 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <div class="header">
      <h2>Blog</h2>
      <a class="button" href={`${store.prefix}/blog/rss`} target="_blank">RSS</a>
    </div>
    <div class="posts">
      {#each store.blog.publicList.data as post (post.id)}
        <article class="card">
          <h3><a href={`/blog/${post.slug}`}>{post.title}</a></h3>
          <p class="meta">
            {post.date ? new Date(post.date).toLocaleDateString() : ''}
            {#if post.tags?.length}
              &mdash;
              {#each post.tags as tag (tag)}
                <a class="tag" href={`/blog/tags/${tag}`}>#{tag}</a>
              {/each}
            {/if}
          </p>
          <p>{post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}</p>
        </article>
      {/each}
    </div>
    <div class="actions">
      <button class="button" disabled={store.blog.publicList.page === 1} onclick={fetchPrevious}>
        &lt;
      </button>
      {store.blog.publicList.page}
      <button
        class="button"
        disabled={store.blog.publicList.page >= store.blog.publicList.pages}
        onclick={fetchNext}
      >
        &gt;
      </button>
    </div>
    <p><a href="/blog/tags">Browse tags</a></p>
  </div>
{/if}

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .posts {
    display: grid;
    gap: 20px;
  }

  .card {
    border: 1px solid var(--color-lightGrey);
    border-radius: 5px;
    padding: 15px;
  }

  .meta {
    color: var(--color-grey);
    font-size: 0.9em;
  }

  .tag {
    margin-right: 8px;
  }

  .actions {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
</style>
