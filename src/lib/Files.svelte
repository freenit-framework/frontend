<script lang="ts">
  import {
    currentPath, entries, filesLoading, filesError,
    listDirectory, createFolder, deleteEntry, uploadFile, downloadUrl, formatSize,
  } from './files/store'
  import type { FileEntry } from './files/store'

  let newFolderName = $state('')
  let showNewFolder = $state(false)
  let actionError = $state('')
  let uploading = $state(false)
  let fileInput: HTMLInputElement

  // Breadcrumb segments from currentPath
  const crumbs = $derived(
    (() => {
      const parts = $currentPath.split('/').filter(Boolean)
      const result: { label: string; path: string }[] = [{ label: 'Files', path: '/' }]
      let acc = ''
      for (const p of parts) {
        acc += '/' + p
        result.push({ label: p, path: acc })
      }
      return result
    })()
  )

  async function navigate(path: string) {
    actionError = ''
    await listDirectory(path)
  }

  async function openEntry(entry: FileEntry) {
    if (entry.isDir) {
      const path = '/' + entry.href.replace(/^\/file\/?/, '').replace(/\/$/, '')
      await navigate(path)
    } else {
      window.open(downloadUrl(entry), '_blank')
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return
    actionError = ''
    try {
      await createFolder($currentPath, newFolderName.trim())
      newFolderName = ''
      showNewFolder = false
    } catch (e) {
      actionError = e instanceof Error ? e.message : 'Failed to create folder'
    }
  }

  async function handleDelete(entry: FileEntry) {
    if (!confirm(`Delete "${entry.name}"?`)) return
    actionError = ''
    try {
      await deleteEntry(entry, $currentPath)
    } catch (e) {
      actionError = e instanceof Error ? e.message : 'Failed to delete'
    }
  }

  async function handleUpload(e: Event) {
    const files = (e.target as HTMLInputElement).files
    if (!files?.length) return
    uploading = true
    actionError = ''
    let errors = 0
    for (const file of Array.from(files)) {
      try { await uploadFile($currentPath, file) }
      catch { errors++ }
    }
    uploading = false
    if (errors > 0) actionError = `${errors} file(s) failed to upload.`
    fileInput.value = ''
  }

  function ext(name: string): string {
    return name.includes('.') ? name.split('.').pop()!.toLowerCase() : ''
  }

  function fileIcon(entry: FileEntry): string {
    if (entry.isDir) return '▸'
    const e = ext(entry.name)
    if (['jpg','jpeg','png','gif','webp','svg'].includes(e)) return '🖼'
    if (['pdf'].includes(e)) return '📄'
    if (['mp3','ogg','flac','wav','m4a'].includes(e)) return '🎵'
    if (['mp4','mkv','avi','mov','webm'].includes(e)) return '🎬'
    if (['zip','tar','gz','bz2','7z','rar'].includes(e)) return '📦'
    return '📄'
  }
</script>

<div class="files-page">
  <div class="toolbar">
    <nav class="breadcrumb" aria-label="Path">
      {#each crumbs as crumb, i (crumb.path)}
        {#if i > 0}<span class="sep">/</span>{/if}
        <button class="crumb-btn" onclick={() => navigate(crumb.path)}>{crumb.label}</button>
      {/each}
    </nav>

    <div class="toolbar-actions">
      <button class="btn-secondary" onclick={() => { showNewFolder = !showNewFolder; newFolderName = '' }}>
        New Folder
      </button>
      <button class="btn-primary" onclick={() => fileInput.click()} disabled={uploading}>
        {uploading ? 'Uploading…' : 'Upload'}
      </button>
      <input
        type="file"
        multiple
        bind:this={fileInput}
        onchange={handleUpload}
        style="display:none"
      />
    </div>
  </div>

  {#if showNewFolder}
    <div class="new-folder-bar">
      <input
        type="text"
        bind:value={newFolderName}
        placeholder="Folder name"
        onkeydown={(e) => e.key === 'Enter' && handleCreateFolder()}
        autofocus
      />
      <button class="btn-primary btn-sm" onclick={handleCreateFolder}>Create</button>
      <button class="btn-secondary btn-sm" onclick={() => { showNewFolder = false }}>Cancel</button>
    </div>
  {/if}

  {#if actionError}
    <div class="action-error">{actionError}</div>
  {/if}

  {#if $filesError}
    <div class="action-error">{$filesError}</div>
  {:else if $filesLoading}
    <div class="state-msg">Loading…</div>
  {:else if $entries.length === 0}
    <div class="state-msg">This folder is empty.</div>
  {:else}
    <table class="file-table">
      <thead>
        <tr>
          <th class="col-name">Name</th>
          <th class="col-size">Size</th>
          <th class="col-modified">Modified</th>
          <th class="col-actions"></th>
        </tr>
      </thead>
      <tbody>
        {#each $entries as entry (entry.href)}
          <tr class="file-row" class:dir={entry.isDir}>
            <td class="col-name">
              <button class="name-btn" onclick={() => openEntry(entry)}>
                <span class="icon">{fileIcon(entry)}</span>
                <span class="name">{entry.name}</span>
              </button>
            </td>
            <td class="col-size">{entry.isDir ? '' : formatSize(entry.size)}</td>
            <td class="col-modified">{entry.modified ? new Date(entry.modified).toLocaleDateString() : ''}</td>
            <td class="col-actions">
              {#if !entry.isDir}
                <a class="action-link" href={downloadUrl(entry)} download={entry.name}>Download</a>
              {/if}
              <button class="action-link danger" onclick={() => handleDelete(entry)}>Delete</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .files-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-secondary-color, #f5f7fb);
    flex-shrink: 0;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .crumb-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--color-primary, #2f63f0);
    padding: 0.1rem 0.2rem;
    white-space: nowrap;
  }

  .crumb-btn:hover { text-decoration: underline; }

  .sep {
    color: var(--color-grey, #60708a);
    font-size: 0.9rem;
  }

  .toolbar-actions {
    display: flex;
    gap: 0.4rem;
    flex-shrink: 0;
  }

  .btn-primary {
    padding: 0.35rem 0.9rem;
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: background 0.15s;
  }

  .btn-primary:hover:not(:disabled) { background: #1e50d8; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-secondary {
    padding: 0.35rem 0.9rem;
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--color-darkGrey, #1b2433);
    transition: background 0.15s;
  }

  .btn-secondary:hover { background: var(--color-lightGrey, #d9e0eb); }

  .btn-sm { padding: 0.25rem 0.65rem; font-size: 0.82rem; }

  .new-folder-bar {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    padding: 0.5rem 1rem;
    background: var(--bg-secondary-color, #f5f7fb);
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  .new-folder-bar input {
    padding: 0.35rem 0.6rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    font-size: 0.88rem;
    width: 14rem;
  }

  .new-folder-bar input:focus {
    outline: none;
    border-color: var(--color-primary, #2f63f0);
  }

  .action-error {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    color: var(--color-error, #d43939);
    background: #fff0f0;
    border-bottom: 1px solid #f0c0c0;
    flex-shrink: 0;
  }

  .state-msg {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: var(--color-grey, #60708a);
    font-size: 0.95rem;
  }

  .file-table {
    flex: 1;
    width: 100%;
    border-collapse: collapse;
    overflow-y: auto;
    display: block;
  }

  .file-table thead {
    position: sticky;
    top: 0;
    background: var(--bg-secondary-color, #f5f7fb);
    z-index: 1;
  }

  .file-table th {
    padding: 0.5rem 0.75rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-grey, #60708a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-align: left;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
  }

  .file-row td {
    padding: 0.45rem 0.75rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    font-size: 0.9rem;
    vertical-align: middle;
  }

  .file-row:hover td { background: rgba(47, 99, 240, 0.04); }

  .col-name { width: 100%; }
  .col-size { white-space: nowrap; color: var(--color-grey, #60708a); font-size: 0.82rem; }
  .col-modified { white-space: nowrap; color: var(--color-grey, #60708a); font-size: 0.82rem; }
  .col-actions { white-space: nowrap; text-align: right; }

  .name-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--color-darkGrey, #1b2433);
    text-align: left;
    padding: 0;
  }

  .file-row.dir .name-btn { font-weight: 600; }
  .name-btn:hover .name { text-decoration: underline; }

  .icon { font-size: 1rem; flex-shrink: 0; }

  .action-link {
    font-size: 0.82rem;
    color: var(--color-primary, #2f63f0);
    text-decoration: none;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0 0.3rem;
  }

  .action-link:hover { text-decoration: underline; }
  .action-link.danger { color: var(--color-error, #d43939); }
</style>
