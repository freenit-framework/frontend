<script lang="ts">
  import { goto } from '$app/navigation'
  import { mailboxTree, selectedMailboxId, selectMailbox, mailLoading } from '$lib/mail/store'
  import type { MailboxNode } from '$lib/mail/types'

  const ROLE_ICONS: Record<string, string> = {
    inbox: '📥',
    sent: '📤',
    drafts: '📝',
    junk: '🚫',
    trash: '🗑',
    archive: '📦',
  }

  let expanded = $state<Set<string>>(new Set())

  function icon(mailbox: MailboxNode): string {
    return ROLE_ICONS[mailbox.role ?? ''] ?? '📁'
  }

  function handleCompose() {
    goto('/mail/compose')
  }

  function toggleExpand(mailboxId: string) {
    const next = new Set(expanded)
    if (next.has(mailboxId)) {
      next.delete(mailboxId)
    } else {
      next.add(mailboxId)
    }
    expanded = next
  }

  async function handleClick(node: MailboxNode) {
    const isSame = $selectedMailboxId === node.id
    if (node.children.length > 0) {
      toggleExpand(node.id)
    }
    if (!isSame) {
      await selectMailbox(node.id)
    }
  }
</script>

{#snippet folderItem(node: MailboxNode, depth: number)}
  {@const hasChildren = node.children.length > 0}
  {@const isExpanded = expanded.has(node.id)}
  <div class="mailbox-row">
    <div class="mailbox-line" style:padding-left="{depth * 1.2}rem">
      {#if hasChildren}
        <span class="expand-icon">{isExpanded ? '▼' : '▶'}</span>
      {:else}
        <span class="expand-spacer"></span>
      {/if}
      <button
        class="mailbox-item"
        class:active={$selectedMailboxId === node.id}
        onclick={() => handleClick(node)}
      >
        <span class="mailbox-icon">{icon(node)}</span>
        <span class="mailbox-name">{node.name}</span>
        {#if node.unreadEmails > 0}
          <span class="unread-badge">{node.unreadEmails}</span>
        {/if}
      </button>
    </div>
    {#if hasChildren && isExpanded}
      {#each node.children as child (child.id)}
        {@render folderItem(child, depth + 1)}
      {/each}
    {/if}
  </div>
{/snippet}

<aside class="sidebar">
  <div class="sidebar-header">
    <button class="compose-btn" onclick={handleCompose}>
      ✏ Compose
    </button>
  </div>

  <nav class="mailbox-list">
    {#if $mailLoading && $mailboxTree.length === 0}
      <div class="loading-folders">Loading folders…</div>
    {:else}
      {#each $mailboxTree as node (node.id)}
        {@render folderItem(node, 0)}
      {/each}
    {/if}
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
    filter: brightness(1.1);
  }

  .mailbox-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0;
  }

  .mailbox-row {
    display: flex;
    flex-direction: column;
  }

  .mailbox-line {
    display: flex;
    align-items: center;
  }

  .mailbox-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex: 1;
    padding: 0.55rem 1rem;
    background: none;
    border: none;
    border-radius: 0;
    cursor: pointer;
    text-align: left;
    font-size: 0.9rem;
    color: var(--font-color, #333333);
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

  .expand-icon {
    font-size: 0.65rem;
    width: 1rem;
    text-align: center;
    flex-shrink: 0;
    user-select: none;
    color: var(--color-grey, #666);
  }

  .expand-spacer {
    width: 1rem;
    flex-shrink: 0;
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

  .loading-folders {
    padding: 1rem;
    text-align: center;
    color: var(--color-grey, #60708a);
    font-size: 0.85rem;
  }
</style>
