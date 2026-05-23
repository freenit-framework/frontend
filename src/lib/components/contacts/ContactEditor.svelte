<script lang="ts">
  import { addressbooks, saveContact, selectContact } from '$lib/contacts/store'
  import type { Contact } from '$lib/contacts/types'

  let {
    contact = null,
    onCancel,
  }: {
    contact?: Contact | null
    onCancel: () => void
  } = $props()

  const isNew = !contact

  let displayName = $state(contact?.displayName ?? '')
  let firstName = $state(contact?.firstName ?? '')
  let lastName = $state(contact?.lastName ?? '')
  let emailsRaw = $state(contact?.emails.join(', ') ?? '')
  let phonesRaw = $state(contact?.phones.join(', ') ?? '')
  let org = $state(contact?.org ?? '')
  let note = $state(contact?.note ?? '')
  let addressbook = $state(contact?.addressbook ?? $addressbooks[0]?.name ?? '')

  let saving = $state(false)
  let error = $state('')

  function splitField(raw: string): string[] {
    return raw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }

  async function handleSave() {
    const dn = displayName.trim() || [firstName, lastName].filter(Boolean).join(' ')
    if (!dn) {
      error = 'Name is required'
      return
    }
    if (!addressbook) {
      error = 'No addressbook available'
      return
    }

    saving = true
    error = ''
    try {
      const uid = contact?.uid ?? crypto.randomUUID()
      const href = contact?.href ?? `/card/${addressbook}/${uid}.vcf`

      await saveContact({
        uid,
        href,
        etag: contact?.etag ?? '',
        addressbook,
        displayName: dn,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emails: splitField(emailsRaw),
        phones: splitField(phonesRaw),
        org: org.trim(),
        note: note.trim(),
        isNew,
      })
      selectContact(uid)
      onCancel()
    } catch (e) {
      error = e instanceof Error ? e.message : 'Save failed'
    } finally {
      saving = false
    }
  }
</script>

<div class="editor">
  <div class="editor-header">
    <h2>{isNew ? 'New Contact' : 'Edit Contact'}</h2>
    <div class="header-actions">
      <button class="btn-secondary" onclick={onCancel} disabled={saving}>Cancel</button>
      <button class="btn-primary" onclick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <div class="form">
    <div class="field-row">
      <label>
        <span class="label">First name</span>
        <input type="text" bind:value={firstName} placeholder="First name" />
      </label>
      <label>
        <span class="label">Last name</span>
        <input type="text" bind:value={lastName} placeholder="Last name" />
      </label>
    </div>

    <label>
      <span class="label">Display name</span>
      <input
        type="text"
        bind:value={displayName}
        placeholder="Display name (auto-filled from first/last)"
      />
    </label>

    <label>
      <span class="label">Email(s)</span>
      <input type="text" bind:value={emailsRaw} placeholder="email@example.com, other@example.com" />
    </label>

    <label>
      <span class="label">Phone(s)</span>
      <input type="text" bind:value={phonesRaw} placeholder="+1 555 000 0000, +44 …" />
    </label>

    <label>
      <span class="label">Organization</span>
      <input type="text" bind:value={org} placeholder="Company or organization" />
    </label>

    <label>
      <span class="label">Note</span>
      <textarea bind:value={note} rows="3" placeholder="Notes…"></textarea>
    </label>

    {#if isNew && $addressbooks.length > 1}
      <label>
        <span class="label">Addressbook</span>
        <select bind:value={addressbook}>
          {#each $addressbooks as book}
            <option value={book.name}>{book.displayName}</option>
          {/each}
        </select>
      </label>
    {/if}
  </div>
</div>

<style>
  .editor {
    padding: 2rem;
    max-width: 600px;
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-darkGrey, #1b2433);
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-primary {
    padding: 0.4rem 1rem;
    background: var(--color-primary, #2f63f0);
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.88rem;
    font-weight: 600;
    transition: background 0.15s;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1e50d8;
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  .btn-secondary:hover:not(:disabled) {
    background: var(--color-lightGrey, #d9e0eb);
  }

  .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error {
    color: var(--color-error, #d43939);
    font-size: 0.88rem;
    margin-bottom: 1rem;
    padding: 0.5rem 0.75rem;
    background: #fff0f0;
    border-radius: 5px;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field-row {
    display: flex;
    gap: 1rem;
  }

  .field-row label {
    flex: 1;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-grey, #60708a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  input,
  textarea,
  select {
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    font-size: 0.9rem;
    font-family: inherit;
    background: var(--bg-color, #fff);
    color: var(--color-darkGrey, #1b2433);
    transition: border-color 0.15s;
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: var(--color-primary, #2f63f0);
  }

  textarea {
    resize: vertical;
  }
</style>
