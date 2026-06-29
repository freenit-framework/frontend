<script lang="ts">
  import { onMount } from 'svelte'
  import Modal from '$lib/Modal.svelte'
  import Input from './Input.svelte'
  import Spinner from './Spinner.svelte'
  import { notification } from '$lib'

  let loading = $state(true)
  let showCreate = $state(false)
  let title = $state('')
  let slug = $state('')
  let content = $state('')
  let tags = $state('')
  let published = $state(false)
  let { store } = $props()

  onMount(async () => {
    const response = await store.blog.fetchAll()
    if (!response.ok) {
      notification.error(response.statusText)
    }
    loading = false
  })

  async function fetchPrevious() {
    const response = await store.blog.fetchAll(store.blog.list.page - 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.blog.fetchAll(store.blog.list.page + 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  function toggleShowCreate(event: Event) {
    event.preventDefault()
    showCreate = !showCreate
  }

  async function create(event: Event) {
    event.preventDefault()
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)
    const response = await store.blog.create({
      title,
      slug,
      content,
      published,
      tags: tagList,
    })
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      title = ''
      slug = ''
      content = ''
      tags = ''
      published = false
      showCreate = false
    }
  }

  async function destroy(id: number) {
    const response = await store.blog.destroy(id)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="root">
    <div class="container">
      <div class="header">
        <h2>Blog Posts</h2>
        <button class="button primary" onclick={toggleShowCreate}>Create</button>
      </div>
      <div class="table">
        <div class="heading">ID</div>
        <div class="heading">Title</div>
        <div class="heading">Slug</div>
        <div class="heading">Published</div>
        <div class="heading">Actions</div>
        {#each store.blog.list.data as post (post.id)}
          <div class="data">{post.id}</div>
          <div class="data">{post.title}</div>
          <div class="data">{post.slug}</div>
          <div class="data">{post.published ? 'Yes' : 'No'}</div>
          <div class="data">
            <button class="button error" onclick={() => destroy(post.id)}>Delete</button>
          </div>
          <div class="border"></div>
        {/each}
      </div>
    </div>
    <div class="actions">
      <button class="button" disabled={store.blog.list.page === 1} onclick={fetchPrevious}>
        &lt;
      </button>
      {store.blog.list.page}
      <button
        class="button"
        disabled={store.blog.list.page >= store.blog.list.pages}
        onclick={fetchNext}
      >
        &gt;
      </button>
    </div>
  </div>
{/if}

<Modal open={showCreate}>
  <h2>Create Blog Post</h2>
  <form onsubmit={create}>
    <Input bind:value={title} autofocus required type="text" name="title" label="Title" />
    <Input bind:value={slug} required type="text" name="slug" label="Slug" />
    <Input bind:value={content} required type="text" name="content" label="Content" />
    <Input bind:value={tags} type="text" name="tags" label="Tags (comma separated)" />
    <label>
      <input type="checkbox" bind:checked={published} />
      Published
    </label>
    <div class="actions">
      <button class="button primary" type="submit">Create</button>
      <button class="button error" onclick={toggleShowCreate}>Close</button>
    </div>
  </form>
</Modal>

<style>
  .table {
    border: 1px solid var(--color-lightGrey);
    border-radius: 5px;
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(5, auto);
  }

  .heading {
    font-weight: bold;
    background-color: var(--bg-secondary-color);
    padding: 5px;
  }

  .data {
    padding: 5px;
  }

  .actions {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
  }

  .actions button {
    margin-left: 10px;
    margin-right: 10px;
  }

  .border {
    grid-column: 1 / 6;
    border-top: 1px solid var(--color-lightGrey);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  label {
    display: block;
    margin-top: 15px;
  }
</style>
