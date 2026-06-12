<script lang="ts">
  import { onMount } from 'svelte'
  import {
    scripts,
    selectedScript,
    sieveLoading,
    sieveError,
    fetchScripts,
    fetchScript,
    saveScript,
    deleteScript,
    setActive,
    deactivate,
    newScript,
  } from './sieve/store'
  import RuleBuilder from './components/sieve/RuleBuilder.svelte'

  let editName = $state('')
  let editContent = $state('')
  let isNew = $state(false)
  let hasUnsavedChanges = $state(false)

  onMount(async () => { await fetchScripts() })

  $effect(() => {
    const s = $selectedScript
    if (s) {
      editName = s.name
      editContent = s.content
      isNew = s.name === ''
      hasUnsavedChanges = false
    }
  })

  async function handleSelect(name: string) {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Discard them?')) return
    }
    await fetchScript(name)
  }

  function handleContentChange(content: string) {
    editContent = content
    hasUnsavedChanges = true
  }

  async function handleSave() {
    if (!editName.trim()) return
    await saveScript(editName.trim(), editContent)
  }

  async function handleDelete(name: string) {
    await deleteScript(name)
  }

  async function handleSetActive(name: string, active: boolean) {
    if (active) {
      await deactivate(name)
    } else {
      await setActive(name)
    }
  }
</script>

<div class="sieve-shell">
  <div class="sieve-sidebar">
    <div class="sidebar-header">
      <span class="sidebar-title">Sieve Scripts</span>
      <button class="new-btn" onclick={newScript}>+ New</button>
    </div>
    {#if $sieveLoading && !$scripts.length}
      <div class="status">Loading…</div>
    {:else if $sieveError}
      <div class="error">{$sieveError}</div>
    {:else}
      <nav class="script-list">
        {#each $scripts as script (script.name)}
          <button
            class="script-item"
            class:active={$selectedScript?.name === script.name}
            onclick={() => handleSelect(script.name)}
          >
            <span class="script-name">{script.name}</span>
            {#if script.active}
              <span class="active-badge">active</span>
            {/if}
          </button>
        {/each}
      </nav>
    {/if}
  </div>

  <div class="sieve-editor">
    {#if $selectedScript !== null}
      <div class="editor-toolbar">
        {#if isNew}
          <input
            class="name-input"
            type="text"
            bind:value={editName}
            placeholder="Script name…"
          />
        {:else}
          <span class="script-title">{editName}</span>
          <button
            class="toggle-btn"
            onclick={() => handleSetActive(editName, $selectedScript?.active ?? false)}
            disabled={$sieveLoading}
          >
            {$selectedScript?.active ? 'Deactivate' : 'Set Active'}
          </button>
          <button
            class="delete-btn"
            onclick={() => handleDelete(editName)}
            disabled={$sieveLoading}
          >
            Delete
          </button>
        {/if}
        <button
          class="save-btn"
          onclick={handleSave}
          disabled={$sieveLoading || !editName.trim()}
        >
          {$sieveLoading ? 'Saving…' : 'Save'}
        </button>
      </div>
      {#if $sieveError}
        <div class="error-bar">{$sieveError}</div>
      {/if}
      <RuleBuilder content={editContent} onChange={handleContentChange} />
    {:else}
      <div class="empty-state">Select a script or create a new one</div>
    {/if}
  </div>
</div>

<style>
  .sieve-shell {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  .sieve-sidebar {
    width: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  .sidebar-title {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--color-darkGrey, #1b2433);
  }

  .new-btn {
    padding: 0.25rem 0.6rem;
    font-size: 0.8rem;
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .new-btn:hover { background: #1e50d8; }

  .script-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0;
  }

  .script-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 0.9rem;
    color: var(--color-darkGrey, #1b2433);
  }

  .script-item:hover { background: rgba(47, 99, 240, 0.07); }

  .script-item.active {
    background: rgba(47, 99, 240, 0.12);
    color: var(--color-primary, #2f63f0);
    font-weight: 600;
  }

  .script-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .active-badge {
    font-size: 0.7rem;
    background: var(--color-success, #28bd14);
    color: #fff;
    padding: 0.1rem 0.4rem;
    border-radius: 10px;
    flex-shrink: 0;
  }

  .sieve-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-secondary-color, #f5f7fb);
    flex-shrink: 0;
  }

  .script-title {
    flex: 1;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .name-input {
    flex: 1;
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .save-btn {
    padding: 0.35rem 0.8rem;
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .save-btn:not(:disabled):hover { background: #1e50d8; }

  .toggle-btn, .delete-btn {
    padding: 0.35rem 0.8rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    background: #fff;
  }

  .toggle-btn:disabled, .delete-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .delete-btn { color: var(--color-error, #d43939); border-color: var(--color-error, #d43939); }
  .delete-btn:not(:disabled):hover { background: var(--color-error, #d43939); color: #fff; }

  .error-bar {
    padding: 0.5rem 1rem;
    background: #fef2f2;
    color: var(--color-error, #d43939);
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .empty-state, .status, .error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 0.95rem;
    color: var(--color-grey, #60708a);
  }

  .error { color: var(--color-error, #d43939); }
</style>
