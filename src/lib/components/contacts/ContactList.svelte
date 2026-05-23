<script lang="ts">
  import { contacts, selectedContactId, selectContact, contactsLoading, contactsError } from '$lib/contacts/store'
  import type { Contact } from '$lib/contacts/types'

  let { onNew }: { onNew: () => void } = $props()

  let search = $state('')

  const filtered = $derived(
    search.trim()
      ? $contacts.filter(
          (c) =>
            c.displayName.toLowerCase().includes(search.toLowerCase()) ||
            c.emails.some((e) => e.toLowerCase().includes(search.toLowerCase())) ||
            c.org.toLowerCase().includes(search.toLowerCase()),
        )
      : $contacts,
  )

  function initials(contact: Contact): string {
    const parts = contact.displayName.split(' ').filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return contact.displayName.slice(0, 2).toUpperCase()
  }
</script>

<div class="contact-list">
  <div class="list-header">
    <span class="list-title">Contacts ({$contacts.length})</span>
    <button class="new-btn" onclick={onNew}>New</button>
  </div>

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

<style>
  .contact-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-right: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-secondary-color, #f5f7fb);
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
  }

  .new-btn {
    padding: 0.3rem 0.75rem;
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: background 0.15s;
  }

  .new-btn:hover {
    background: #1e50d8;
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
