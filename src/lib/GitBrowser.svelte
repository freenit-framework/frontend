<script lang="ts">
  import { onMount } from 'svelte'
  import { notification } from '$lib'
  import Spinner from './Spinner.svelte'

  let { pk, store } = $props()
  let loading = $state(true)
  let ref = $state('')
  let treePath = $state('')
  let view = $state<'tree' | 'commits' | 'blob'>('tree')

  onMount(async () => {
    loading = true
    await store.git.fetch(pk)
    ref = store.git.detail.default_branch || 'main'
    const [refsResponse, readmeResponse, treeResponse, cloneResponse] = await Promise.all([
      store.git.fetchRefs(pk),
      store.git.fetchReadme(pk, ref),
      store.git.fetchTree(pk, ref, ''),
      store.git.fetchCloneUrl(pk),
    ])
    if (!refsResponse.ok) notification.error(refsResponse.statusText)
    if (!readmeResponse.ok && readmeResponse.status !== 404) {
      notification.error(readmeResponse.statusText)
    }
    if (!treeResponse.ok) notification.error(treeResponse.statusText)
    if (!cloneResponse.ok) notification.error(cloneResponse.statusText)
    loading = false
  })

  async function switchBranch(newRef: string) {
    ref = newRef
    treePath = ''
    view = 'tree'
    store.git.blob = null
    await Promise.all([
      store.git.fetchTree(pk, ref, ''),
      store.git.fetchReadme(pk, ref),
    ])
  }

  async function openEntry(entry: any) {
    if (entry.type === 'tree') {
      treePath = treePath ? `${treePath}/${entry.name}` : entry.name
      view = 'tree'
      const response = await store.git.fetchTree(pk, ref, treePath)
      if (!response.ok) notification.error(response.statusText)
    } else {
      const path = treePath ? `${treePath}/${entry.name}` : entry.name
      view = 'blob'
      const response = await store.git.fetchBlob(pk, ref, path)
      if (!response.ok) notification.error(response.statusText)
    }
  }

  async function navigateUp() {
    const parts = treePath.split('/')
    parts.pop()
    treePath = parts.join('/')
    const response = await store.git.fetchTree(pk, ref, treePath)
    if (!response.ok) notification.error(response.statusText)
  }

  async function showCommits() {
    view = 'commits'
    const response = await store.git.fetchCommits(pk, ref)
    if (!response.ok) notification.error(response.statusText)
  }

  async function showTree() {
    view = 'tree'
    const response = await store.git.fetchTree(pk, ref, treePath)
    if (!response.ok) notification.error(response.statusText)
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="browser">
    <div class="toolbar">
      <select bind:value={ref} onchange={() => switchBranch(ref)}>
        {#each store.git.refs as r (r.sha)}
          <option value={r.name}>{r.name}</option>
        {/each}
      </select>
      <button class="button" onclick={showTree}>Files</button>
      <button class="button" onclick={showCommits}>Commits</button>
      {#if store.git.cloneUrl}
        <code class="clone-url">git clone {store.git.cloneUrl}</code>
      {/if}
    </div>

    {#if view === 'tree'}
      <div class="breadcrumbs">
        <button class="button link" onclick={() => switchBranch(ref)}>{ref}</button>
        {#if treePath}
          <span>/</span>
          <button class="button link" onclick={navigateUp}>..</button>
          <span>/ {treePath}</span>
        {/if}
      </div>

      {#if store.git.readme}
        <div class="readme">
          <h4>{store.git.readme.name}</h4>
          <pre>{store.git.readme.content}</pre>
        </div>
      {/if}

      <div class="file-list">
        {#each store.git.tree as entry (entry.sha)}
          <button class="entry" onclick={() => openEntry(entry)}>
            {#if entry.type === 'tree'}
              📁 {entry.name}/
            {:else}
              📄 {entry.name}
            {/if}
          </button>
        {/each}
      </div>
    {/if}

    {#if view === 'commits'}
      <div class="commit-list">
        {#each store.git.commits as commit (commit.sha)}
          <div class="commit">
            <div class="commit-message">{commit.message}</div>
            {#if commit.task_refs?.length}
              <div class="task-refs">
                {#each commit.task_refs as ref (ref.task_id)}
                  <span class="task-ref {ref.relation}">
                    {ref.relation}: #{ref.task_id}
                  </span>
                {/each}
              </div>
            {/if}
            <div class="commit-meta">
              {commit.author} • {commit.sha.slice(0, 7)} •
              {commit.timestamp ? new Date(commit.timestamp).toLocaleString() : ''}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    {#if view === 'blob'}
      <div class="blob-actions">
        <button class="button" onclick={showTree}>Back to files</button>
      </div>
      {#if store.git.blob}
        <h4>{store.git.blob.name}</h4>
        {#if store.git.blob.binary}
          <p>Binary file ({store.git.blob.size} bytes)</p>
        {:else}
          <pre class="blob-content">{store.git.blob.content}</pre>
        {/if}
      {/if}
    {/if}
  </div>
{/if}

<style>
  .browser {
    margin-top: 1rem;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .clone-url {
    margin-left: auto;
    font-size: 0.9rem;
  }

  .breadcrumbs {
    margin-bottom: 1rem;
  }

  .button.link {
    background: none;
    border: none;
    color: var(--color-primary);
    padding: 0;
    cursor: pointer;
  }

  .file-list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-lightGrey);
    border-radius: 5px;
    overflow: hidden;
  }

  .entry {
    text-align: left;
    padding: 0.5rem;
    background: var(--bg-color);
    color: var(--font-color);
    border: none;
    border-bottom: 1px solid var(--color-lightGrey);
    cursor: pointer;
  }

  .entry:hover {
    background: var(--bg-secondary-color);
  }

  .entry:last-child {
    border-bottom: none;
  }

  .readme {
    border: 1px solid var(--color-lightGrey);
    border-radius: 5px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .readme h4 {
    margin-top: 0;
  }

  .commit-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .commit {
    border: 1px solid var(--color-lightGrey);
    border-radius: 5px;
    padding: 0.75rem;
  }

  .commit-message {
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  .commit-meta {
    font-size: 0.85rem;
    color: var(--color-grey);
  }

  .task-refs {
    display: flex;
    gap: 0.5rem;
    margin: 0.25rem 0;
    flex-wrap: wrap;
  }

  .task-ref {
    font-size: 0.8rem;
    padding: 0.15rem 0.4rem;
    border-radius: 3px;
    background: var(--bg-secondary-color);
    border: 1px solid var(--color-lightGrey);
  }

  .task-ref.fix {
    background: var(--color-error);
    color: white;
    border-color: var(--color-error);
  }

  .blob-actions {
    margin-bottom: 1rem;
  }

  .blob-content {
    background: var(--bg-secondary-color);
    padding: 1rem;
    overflow-x: auto;
  }

  select {
    padding: 0.5rem;
    border: 1px solid var(--color-lightGrey);
    border-radius: 4px;
    background: var(--bg-color);
    color: var(--font-color);
  }
</style>
