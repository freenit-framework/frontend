<script lang="ts">
  import { deleteContact } from '$lib/contacts/store'
  import type { Contact } from '$lib/contacts/types'

  let { contact, onEdit }: { contact: Contact; onEdit: () => void } = $props()

  let deleting = $state(false)
  let error = $state('')

  async function handleDelete() {
    if (!confirm(`Delete ${contact.displayName}?`)) return
    deleting = true
    error = ''
    try {
      await deleteContact(contact)
    } catch (e) {
      error = e instanceof Error ? e.message : 'Delete failed'
    } finally {
      deleting = false
    }
  }
</script>

<div class="viewer">
  <div class="viewer-header">
    <div class="avatar-lg">
      {contact.displayName.slice(0, 2).toUpperCase()}
    </div>
    <div class="header-info">
      <h2 class="display-name">{contact.displayName}</h2>
      {#if contact.org}
        <span class="org">{contact.org}</span>
      {/if}
    </div>
    <div class="actions">
      <button class="btn-secondary" onclick={onEdit}>Edit</button>
      <button class="btn-danger" onclick={handleDelete} disabled={deleting}>
        {deleting ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <div class="fields">
    {#if contact.emails.length > 0}
      <div class="field">
        <span class="field-label">Email</span>
        <span class="field-values">
          {#each contact.emails as email (email)}
            <a href="mailto:{email}" class="field-link">{email}</a>
          {/each}
        </span>
      </div>
    {/if}

    {#if contact.phones.length > 0}
      <div class="field">
        <span class="field-label">Phone</span>
        <span class="field-values">
          {#each contact.phones as phone (phone)}
            <a href="tel:{phone}" class="field-link">{phone}</a>
          {/each}
        </span>
      </div>
    {/if}

    {#if contact.org}
      <div class="field">
        <span class="field-label">Organization</span>
        <span class="field-value">{contact.org}</span>
      </div>
    {/if}

    {#if contact.note}
      <div class="field">
        <span class="field-label">Note</span>
        <span class="field-value note">{contact.note}</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .viewer {
    padding: 2rem;
    max-width: 600px;
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .viewer-header {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .avatar-lg {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background: var(--color-primary, #2f63f0);
    color: var(--color-darkGrey);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .header-info {
    flex: 1;
    min-width: 0;
  }

  h2 {
    margin: 0 0 0.2rem;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--color-darkGrey, #1b2433);
  }

  .org {
    font-size: 0.9rem;
    color: var(--color-grey, #60708a);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .btn-secondary {
    padding: 0.4rem 0.9rem;
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.88rem;
    color: var(--color-darkGrey, #1b2433);
    transition: background 0.15s;
  }

  .btn-secondary:hover {
    background: var(--color-lightGrey, #d9e0eb);
  }

  .btn-danger {
    padding: 0.4rem 0.9rem;
    background: none;
    border: 1px solid var(--color-error);
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.88rem;
    color: var(--color-error, #d43939);
    transition: background 0.15s;
  }

  .btn-danger:hover:not(:disabled) {
    background: var(--bg-error);
  }

  .btn-danger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    color: var(--color-error, #d43939);
    font-size: 0.88rem;
    margin-bottom: 1rem;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .field-label {
    width: 7rem;
    flex-shrink: 0;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-grey, #60708a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding-top: 0.1rem;
  }

  .field-values {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .field-value {
    font-size: 0.92rem;
    color: var(--color-darkGrey, #1b2433);
  }

  .field-value.note {
    white-space: pre-wrap;
  }

  .field-link {
    font-size: 0.92rem;
    color: var(--color-primary, #2f63f0);
    text-decoration: none;
  }

  .field-link:hover {
    text-decoration: underline;
  }
</style>
