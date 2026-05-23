<script lang="ts">
  import { goto } from '$app/navigation'
  import { mailboxes, selectedMailboxId, selectMailbox } from '$lib/mail/store'
  import type { Mailbox } from '$lib/mail/types'

  const ROLE_ICONS: Record<string, string> = {
    inbox: '📥',
    sent: '📤',
    drafts: '📝',
    junk: '🚫',
    trash: '🗑',
    archive: '📦',
  }

  function icon(mailbox: Mailbox): string {
    return ROLE_ICONS[mailbox.role ?? ''] ?? '📁'
  }

  async function handleSelect(mailboxId: string) {
    await selectMailbox(mailboxId)
  }

  function handleCompose() {
    goto('/mail/compose')
  }


</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <button class="compose-btn" onclick={handleCompose}>
      ✏ Compose
    </button>
  </div>

  <nav class="mailbox-list">
    {#each $mailboxes as mailbox (mailbox.id)}
      <button
        class="mailbox-item"
        class:active={$selectedMailboxId === mailbox.id}
        onclick={() => handleSelect(mailbox.id)}
      >
        <span class="mailbox-icon">{icon(mailbox)}</span>
        <span class="mailbox-name">{mailbox.name}</span>
        {#if mailbox.unreadEmails > 0}
          <span class="unread-badge">{mailbox.unreadEmails}</span>
        {/if}
      </button>
    {/each}
  </nav>


</aside>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-right: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-secondary-color, #f5f7fb);
    overflow: hidden;
  }

  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  .compose-btn {
    display: block;
    width: 100%;
    padding: 0.6rem 1rem;
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    text-align: left;
    transition: background 0.15s;
  }

  .compose-btn:hover {
    background: #1e50d8;
  }

  .mailbox-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0;
  }

  .mailbox-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.55rem 1rem;
    background: none;
    border: none;
    border-radius: 0;
    cursor: pointer;
    text-align: left;
    font-size: 0.9rem;
    color: var(--color-darkGrey, #1b2433);
    transition: background 0.1s;
  }

  .mailbox-item:hover {
    background: rgba(47, 99, 240, 0.07);
  }

  .mailbox-item.active {
    background: rgba(47, 99, 240, 0.12);
    color: var(--color-primary, #2f63f0);
    font-weight: 600;
  }

  .mailbox-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .mailbox-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .unread-badge {
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.1rem 0.45rem;
    min-width: 1.4rem;
    text-align: center;
    flex-shrink: 0;
  }


</style>
