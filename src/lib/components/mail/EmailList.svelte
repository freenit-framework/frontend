<script lang="ts">
  import {
    emails,
    selectedEmailId,
    selectedMailbox,
    emailsLoading,
    mailError,
    selectEmail,
    deleteEmail,
    mailboxes,
    moveEmail,
  } from '$lib/mail/store'
  import EmailListItem from './EmailListItem.svelte'

  let searchQuery = $state('')

  const filteredEmails = $derived(
    searchQuery.trim()
      ? $emails.filter(e => {
          const q = searchQuery.toLowerCase()
          const from = e.from?.[0]
          return (
            e.subject?.toLowerCase().includes(q) ||
            e.preview?.toLowerCase().includes(q) ||
            from?.email.toLowerCase().includes(q) ||
            from?.name?.toLowerCase().includes(q)
          )
        })
      : $emails,
  )

  async function handleSelect(emailId: string) {
    if ($selectedEmailId !== emailId) {
      await selectEmail(emailId)
    }
  }

  async function handleDelete(emailId: string) {
    await deleteEmail(emailId)
  }

  function archiveMailboxId() {
    return $mailboxes.find(m => m.role === 'archive')?.id ?? null
  }

  async function handleArchive(emailId: string) {
    const archiveId = archiveMailboxId()
    if (archiveId) await moveEmail(emailId, archiveId)
  }
</script>

<div class="email-list">
  <div class="list-header">
    <h3>{$selectedMailbox?.name ?? 'Inbox'}</h3>
    <span class="count">{filteredEmails.length}</span>
  </div>

  <div class="search-bar">
    <input
      type="search"
      placeholder="Search…"
      bind:value={searchQuery}
      aria-label="Search emails"
    />
  </div>

  {#if $mailError}
    <div class="error-bar">{$mailError}</div>
  {/if}

  {#if $emailsLoading && $emails.length === 0}
    <div class="status">Loading…</div>
  {:else if filteredEmails.length === 0}
    <div class="status">
      {searchQuery ? 'No results' : 'No messages'}
    </div>
  {:else}
    <div class="list-body">
      {#each filteredEmails as email (email.id)}
        <div class="item-wrap">
          <EmailListItem
            {email}
            selected={$selectedEmailId === email.id}
            onclick={() => handleSelect(email.id)}
          />
          <div class="item-actions">
            {#if archiveMailboxId()}
              <button
                title="Archive"
                class="action-btn"
                onclick={(e) => { e.stopPropagation(); handleArchive(email.id) }}
              >📦</button>
            {/if}
            <button
              title="Delete"
              class="action-btn delete"
              onclick={(e) => { e.stopPropagation(); handleDelete(email.id) }}
            >🗑</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .email-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-right: 1px solid var(--color-lightGrey, #d9e0eb);
    overflow: hidden;
    background: var(--bg-color);
  }

  .list-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-darkGrey, #1b2433);
    flex: 1;
  }

  .count {
    font-size: 0.8rem;
    color: var(--color-grey, #60708a);
  }

  .search-bar {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  .search-bar input {
    width: 100%;
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    font-size: 0.875rem;
    box-sizing: border-box;
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .search-bar input:focus {
    outline: none;
    border-color: var(--color-primary, #2f63f0);
  }

  .error-bar {
    padding: 0.5rem 1rem;
    background: var(--bg-error);
    color: var(--color-error, #d43939);
    font-size: 0.85rem;
    border-bottom: 1px solid var(--color-error);
    flex-shrink: 0;
  }

  .status {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--color-grey, #60708a);
    font-size: 0.9rem;
    flex: 1;
  }

  .list-body {
    flex: 1;
    overflow-y: auto;
  }

  .item-wrap {
    position: relative;
  }

  .item-actions {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    display: none;
    gap: 0.25rem;
    background: var(--bg-color);
    border-radius: 4px;
    padding: 0.15rem;
  }

  .item-wrap:hover .item-actions {
    display: flex;
  }

  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.2rem 0.3rem;
    border-radius: 3px;
    font-size: 0.875rem;
    opacity: 0.7;
    transition: opacity 0.1s, background 0.1s;
  }

  .action-btn:hover {
    opacity: 1;
    background: var(--color-lightGrey);
  }

  .action-btn.delete:hover {
    background: var(--bg-error);
  }
</style>
