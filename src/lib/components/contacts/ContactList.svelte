<script lang="ts">
  import { onMount } from 'svelte'
  import {
    contacts,
    selectedContactId,
    selectContact,
    contactsLoading,
    contactsError,
    addressbooks,
    selectedAddressbookName,
    importContacts,
    initContacts,
    createAddressbook,
    deleteAddressbook,
    renameAddressbook,
    selectAddressbook,
    exportContacts,
    downloadVCard,
  } from '$lib/contacts/store'
  import type { Contact } from '$lib/contacts/types'

  let { onNew }: { onNew: () => void } = $props()

  onMount(() => {
    initContacts()
  })

  let search = $state('')
  let fileInput: HTMLInputElement | null = $state(null)
  let importing = $state(false)
  let importMessage = $state('')
  let importProgress = $state({ current: 0, total: 0 })
  let showCreateBook = $state(false)
  let newBookDisplayName = $state('')
  let deletingBook = $state('')
  let editingBook = $state('')
  let editBookName = $state('')

  const filtered = $derived(
    search.trim()
      ? $contacts.filter(
          (c) =>
            matchesSearch(c) &&
            ($selectedAddressbookName === '' || c.addressbook === $selectedAddressbookName),
        )
      : $contacts.filter(
          (c) => $selectedAddressbookName === '' || c.addressbook === $selectedAddressbookName,
        ),
  )

  function matchesSearch(c: Contact): boolean {
    const q = search.toLowerCase()
    return (
      c.displayName.toLowerCase().includes(q) ||
      c.emails.some((e) => e.toLowerCase().includes(q)) ||
      c.org.toLowerCase().includes(q)
    )
  }

  function initials(contact: Contact): string {
    const parts = contact.displayName.split(' ').filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return contact.displayName.slice(0, 2).toUpperCase()
  }

  function handleImportClick() {
    importMessage = ''
    fileInput?.click()
  }

  async function handleFileSelected(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    if ($addressbooks.length === 0) {
      await initContacts()
    }

    if ($selectedAddressbookName === '') {
      importMessage = 'No addressbook selected.'
      return
    }

    importing = true
    importMessage = ''
    importProgress = { current: 0, total: 0 }
    try {
      const result = await importContacts(file, $selectedAddressbookName, (current, total) => {
        importProgress = { current, total }
      })
      if (result.failed === 0) {
        importMessage = `Imported ${result.imported} contact${result.imported === 1 ? '' : 's'}.`
      } else {
        importMessage = `Imported ${result.imported}, failed ${result.failed}.`
      }
    } catch (err) {
      importMessage = err instanceof Error ? err.message : 'Import failed'
    } finally {
      importing = false
      importProgress = { current: 0, total: 0 }
    }
  }

  function bookIdFromName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'addressbook'
  }

  async function handleCreateBook() {
    const displayName = newBookDisplayName.trim()
    if (!displayName) return
    try {
      await createAddressbook(bookIdFromName(displayName), displayName)
      newBookDisplayName = ''
      showCreateBook = false
    } catch (err) {
      importMessage = err instanceof Error ? err.message : 'Failed to create addressbook'
    }
  }

  async function handleDeleteBook(name: string) {
    const book = $addressbooks.find((b) => b.name === name)
    if (!book) return
    if (!confirm(`Delete address book "${book.displayName || book.name}"? This will also delete all contacts in it.`)) {
      return
    }
    deletingBook = name
    try {
      await deleteAddressbook(book)
    } catch (err) {
      importMessage = err instanceof Error ? err.message : 'Failed to delete addressbook'
    } finally {
      deletingBook = ''
    }
  }

  function startEditBook(book: { name: string; displayName: string }) {
    editingBook = book.name
    editBookName = book.displayName || book.name
    importMessage = ''
  }

  async function handleRenameBook(book: { name: string; displayName: string }) {
    const name = editBookName.trim()
    if (!name || name === book.displayName) {
      editingBook = ''
      return
    }
    try {
      await renameAddressbook(book, name)
      editingBook = ''
      importMessage = ''
    } catch (err) {
      importMessage = err instanceof Error ? err.message : 'Failed to rename addressbook'
    }
  }

  function handleExportClick() {
    importMessage = ''
    const bookName = $selectedAddressbookName
    if (bookName === '') {
      importMessage = 'No addressbook selected.'
      return
    }
    const vcf = exportContacts(bookName)
    if (!vcf) {
      importMessage = 'No contacts to export.'
      return
    }
    const book = $addressbooks.find((b) => b.name === bookName)
    const fileName = `${(book?.displayName || bookName).replace(/[^a-z0-9_-]/gi, '_')}.vcf`
    downloadVCard(vcf, fileName)
  }
</script>

<div class="contact-list">
  <div class="books-section">
    <div class="section-header">
      <span class="section-title">Address Books</span>
      <button
        class="icon-btn"
        title="New address book"
        onclick={() => { showCreateBook = !showCreateBook; importMessage = '' }}
      >
        +
      </button>
    </div>

    {#if showCreateBook}
      <div class="create-book-form">
        <input
          type="text"
          placeholder="Address book name"
          bind:value={newBookDisplayName}
        />
        <div class="form-actions">
          <button class="save-btn" onclick={handleCreateBook} disabled={!newBookDisplayName.trim()}>
            Create
          </button>
          <button onclick={() => showCreateBook = false}>Cancel</button>
        </div>
      </div>
    {/if}

    <nav class="book-list">
      <button
        class="book-item"
        class:active={$selectedAddressbookName === ''}
        onclick={() => selectAddressbook('')}
      >
        <span class="book-name">All</span>
        <span class="book-count">{$contacts.length}</span>
      </button>
      {#each $addressbooks as book (book.name)}
        {#if editingBook === book.name}
          <div class="book-item editing">
            <input
              type="text"
              bind:value={editBookName}
              onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleRenameBook(book) } else if (e.key === 'Escape') { editingBook = '' } }}
            />
            <div class="edit-actions">
              <button class="save-btn" onclick={() => handleRenameBook(book)}>Save</button>
              <button onclick={() => editingBook = ''}>Cancel</button>
            </div>
          </div>
        {:else}
          <button
            class="book-item"
            class:active={$selectedAddressbookName === book.name}
            onclick={() => selectAddressbook(book.name)}
          >
            <span class="book-name">{book.displayName || book.name}</span>
            <span class="book-count">
              {$contacts.filter((c) => c.addressbook === book.name).length}
            </span>
            <span
              class="edit-book"
              onclick={(e) => { e.stopPropagation(); startEditBook(book) }}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); startEditBook(book) } }}
              role="button"
              tabindex={0}
              title="Rename address book"
            >
              ✎
            </span>
            <span
              class="delete-book"
              onclick={(e) => { e.stopPropagation(); handleDeleteBook(book.name) }}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleDeleteBook(book.name) } }}
              role="button"
              tabindex={0}
              title="Delete address book"
            >
              {deletingBook === book.name ? '…' : '×'}
            </span>
          </button>
        {/if}
      {/each}
    </nav>
  </div>

  <div class="contacts-section">
    <div class="list-header">
      <span class="list-title">
        {$selectedAddressbookName === '' ? 'All Contacts' : ($addressbooks.find((b) => b.name === $selectedAddressbookName)?.displayName || $selectedAddressbookName)}
        ({filtered.length})
      </span>
      <div class="header-btns">
        <button class="export-btn" onclick={handleExportClick} disabled={$selectedAddressbookName === ''}>
          Export
        </button>
        <button class="import-btn" onclick={handleImportClick} disabled={importing || $selectedAddressbookName === ''}>
          {importing ? `Importing ${importProgress.current}/${importProgress.total}` : 'Import'}
        </button>
        <button class="new-btn" onclick={onNew} disabled={$selectedAddressbookName === ''}>New</button>
      </div>
      <input
        bind:this={fileInput}
        type="file"
        accept=".vcf,text/vcard"
        onchange={handleFileSelected}
        class="file-input"
      />
    </div>

    {#if importMessage}
      <div class="import-msg" class:error={importMessage.includes('failed') || importMessage.includes('No')}>
        {importMessage}
      </div>
    {/if}

    <div class="search-bar">
      <input
        type="search"
        placeholder="Search contacts…"
        bind:value={search}
      />
    </div>

    {#if $contactsLoading}
      <div class="state-msg">Loading contacts…</div>
    {:else if $contactsError}
      <div class="state-msg error">{$contactsError}</div>
    {:else if filtered.length === 0}
      <div class="state-msg">No contacts found.</div>
    {:else}
      <nav class="list-items">
        {#each filtered as contact (contact.uid)}
          <button
            class="contact-item"
            class:active={$selectedContactId === contact.uid}
            onclick={() => selectContact(contact.uid)}
          >
            <span class="avatar">{initials(contact)}</span>
            <span class="info">
              <span class="name">{contact.displayName}</span>
              {#if contact.emails.length > 0}
                <span class="email">{contact.emails[0]}</span>
              {:else if contact.org}
                <span class="email">{contact.org}</span>
              {/if}
            </span>
          </button>
        {/each}
      </nav>
    {/if}
  </div>
</div>

<style>
  .contact-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-right: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-secondary-color, #f5f7fb);
    overflow: hidden;
  }

  .books-section {
    flex-shrink: 0;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    max-height: 45%;
    display: flex;
    flex-direction: column;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 1rem;
    flex-shrink: 0;
  }

  .section-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-grey, #60708a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .icon-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    background: #fff;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    color: var(--color-darkGrey, #1b2433);
  }

  .icon-btn:hover {
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .create-book-form {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .create-book-form input {
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .form-actions {
    display: flex;
    gap: 0.4rem;
  }

  .form-actions button {
    flex: 1;
    padding: 0.3rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    background: var(--bg-color);
    color: var(--font-color, #333333);
    font-size: 0.8rem;
    cursor: pointer;
  }

  .form-actions .save-btn {
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border-color: var(--color-primary, #2f63f0);
  }

  .book-list {
    overflow-y: auto;
    padding: 0.25rem 0;
  }

  .book-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    width: 100%;
    padding: 0.5rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 0.88rem;
    color: var(--color-darkGrey, #1b2433);
    position: relative;
  }

  .book-item:hover {
    background: rgba(47, 99, 240, 0.07);
  }

  .book-item.active {
    background: rgba(47, 99, 240, 0.12);
    color: var(--color-primary, #2f63f0);
    font-weight: 600;
  }

  .book-item.editing {
    background: var(--bg-color, #fff);
    flex-wrap: wrap;
  }

  .book-item.editing input {
    flex: 1 1 100%;
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    font-size: 0.85rem;
  }

  .edit-actions {
    display: flex;
    gap: 0.4rem;
    flex: 1 1 100%;
    margin-top: 0.3rem;
  }

  .edit-actions button {
    padding: 0.25rem 0.6rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    background: #fff;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.78rem;
  }

  .edit-actions .save-btn {
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border-color: var(--color-primary, #2f63f0);
  }

  .book-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .book-count {
    font-size: 0.75rem;
    color: var(--color-grey, #60708a);
    background: var(--bg-color, #fff);
    padding: 0.1rem 0.4rem;
    border-radius: 10px;
  }

  .book-item.active .book-count {
    color: var(--color-primary, #2f63f0);
  }

  .edit-book,
  .delete-book {
    display: none;
    font-size: 1rem;
    padding: 0 0.2rem;
    line-height: 1;
    cursor: pointer;
  }

  .edit-book {
    color: var(--color-grey, #60708a);
  }

  .delete-book {
    color: var(--color-error, #d43939);
    font-size: 1.1rem;
  }

  .book-item:hover .edit-book,
  .book-item:hover .delete-book {
    display: block;
  }

  .edit-book:hover {
    color: var(--color-primary, #2f63f0);
  }

  .contacts-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  .list-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-grey, #60708a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    max-width: 50%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-btns {
    display: flex;
    gap: 0.4rem;
  }

  .new-btn, .import-btn, .export-btn {
    padding: 0.3rem 0.75rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: background 0.15s;
    background: var(--color-primary, #2f63f0);
    color: #fff;
  }

  .new-btn:hover:not(:disabled), .import-btn:hover:not(:disabled), .export-btn:hover:not(:disabled) {
    background: #1e50d8;
  }

  .new-btn:disabled, .import-btn:disabled, .export-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .file-input {
    display: none;
  }

  .import-msg {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    color: var(--color-success, #28bd14);
    background: #f0fdf0;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  .import-msg.error {
    color: var(--color-error, #d43939);
    background: #fef2f2;
  }

  .search-bar {
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  .search-bar input {
    width: 100%;
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    font-size: 0.88rem;
    background: var(--bg-color, #fff);
    box-sizing: border-box;
  }

  .search-bar input:focus {
    outline: none;
    border-color: var(--color-primary, #2f63f0);
  }

  .state-msg {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--color-grey, #60708a);
    font-size: 0.9rem;
  }

  .state-msg.error {
    color: var(--color-error, #d43939);
  }

  .list-items {
    flex: 1;
    overflow-y: auto;
    padding: 0.4rem 0;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.55rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
  }

  .contact-item:hover {
    background: rgba(47, 99, 240, 0.07);
  }

  .contact-item.active {
    background: rgba(47, 99, 240, 0.12);
  }

  .avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--color-primary, #2f63f0);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .name {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-darkGrey, #1b2433);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .contact-item.active .name {
    color: var(--color-primary, #2f63f0);
  }

  .email {
    font-size: 0.8rem;
    color: var(--color-grey, #60708a);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
