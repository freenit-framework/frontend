<script lang="ts">
  import { onMount } from 'svelte'
  import { notification } from '$lib'
  import Spinner from './Spinner.svelte'

  let loading = $state(true)
  let { store, name } = $props()

  onMount(async () => {
    loading = true
    const response = await store.blog.fetchPostsByTag(name)
    if (!response.ok) {
      notification.error(response.statusText)
    }
    loading = false
  })

  async function fetchPrevious() {
    const response = await store.blog.fetchPostsByTag(name, store.blog.tagPosts.page - 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.blog.fetchPostsByTag(name, store.blog.tagPosts.page + 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>Posts tagged #{name}</h2>
    <div class="posts">
      {#each store.blog.tagPosts.data as post (post.id)}
        <article class="card">
          <h3><a href={`/blog/${post.slug}`}>{post.title}</a></h3>
          <p class="meta">
            {post.date ? new Date(post.date).toLocaleDateString() : ''}
          </p>
          <p>{post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}</p>
        </article>
      {/each}
    </div>
    <div class="actions">
      <button class="button" disabled={store.blog.tagPosts.page === 1} onclick={fetchPrevious}>
        &lt;
      </button>
      {store.blog.tagPosts.page}
      <button
        class="button"
        disabled={store.blog.tagPosts.page >= store.blog.tagPosts.pages}
        onclick={fetchNext}
      >
        &gt;
      </button>
    </div>
    <p><a href="/blog/tags">Browse tags</a></p>
  </div>
{/if}

<style>
  .posts {
    display: grid;
    gap: 20px;
    margin-top: 20px;
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

  .actions {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
</style>
