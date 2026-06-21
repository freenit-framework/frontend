<script lang="ts">
  import { goto } from '$app/navigation'
  import store from '$lib/store'
  import {
    identities,
    composeParams,
    sendEmail,
    mailError,
    emailContent,
  } from '$lib/mail/store'
  import type { EmailAddress, Identity } from '$lib/mail/types'

  const params = $derived($composeParams)

  let identity = $state<Identity | null>(null)
  let toRaw = $state('')
  let ccRaw = $state('')
  let bccRaw = $state('')
  let subject = $state('')
  let body = $state('')
  let showCc = $state(false)
  let showBcc = $state(false)
  let sendError = $state<string | null>(null)
  let sending = $state(false)
  let attachments = $state<{ id: string; file: File }[]>([])
  let fileInput = $state<HTMLInputElement | null>(null)
  let attachCounter = 0

  $effect(() => {
    if ($identities.length && !identity) {
      identity = $identities[0]
    }
  })

  $effect(() => {
    if (params) {
      subject = params.subject ?? ''
      toRaw = params.to?.map(a => (a.name ? `"${a.name}" <${a.email}>` : a.email)).join(', ') ?? ''
      ccRaw = params.cc?.map(a => (a.name ? `"${a.name}" <${a.email}>` : a.email)).join(', ') ?? ''

      // Build reply quote
      const orig = params.replyToEmail
      if (orig) {
        const origContent = $emailContent[orig.id]
        const textValue =
          origContent?.bodyValues &&
          origContent?.textBody?.[0]?.partId
            ? origContent.bodyValues[origContent.textBody[0].partId]?.value
            : null
        const fromStr = orig.from?.map(a => a.name || a.email).join(', ') ?? ''
        const dateStr = new Date(orig.receivedAt).toLocaleString()
        const quote = textValue
          ? `\n\n---\nOn ${dateStr}, ${fromStr} wrote:\n${textValue.split('\n').map(l => `> ${l}`).join('\n')}`
          : ''
        body = params.body ?? quote
      } else {
        body = params.body ?? ''
      }
    }
  })

  function parseAddresses(raw: string): EmailAddress[] {
    if (!raw.trim()) return []
    return raw.split(/[,;]+/).map(s => {
      s = s.trim()
      const match = s.match(/^"?([^"<]+)"?\s*<([^>]+)>$/)
      if (match) return { name: match[1].trim(), email: match[2].trim() }
      return { email: s }
    }).filter(a => a.email)
  }

  async function handleSend() {
    if (!identity?.id) {
      sendError = 'Please select a sender identity'
      return
    }
    const to = parseAddresses(toRaw)
    if (!to.length) {
      sendError = 'Please add at least one recipient'
      return
    }

    sendError = null
    sending = true
    try {
      await sendEmail({
        identityId: identity!.id,
        from: { name: identity!.name, email: store.user.profile.email },
        to,
        cc: parseAddresses(ccRaw),
        bcc: parseAddresses(bccRaw),
        subject,
        textBody: body,
        inReplyTo: params?.inReplyTo,
        references: params?.references,
        attachments: attachments.map(a => a.file),
      })
      composeParams.set(null)
      await goto('/mail')
    } catch {
      sendError = $mailError ?? 'Failed to send email'
    } finally {
      sending = false
    }
  }

  async function handleDiscard() {
    composeParams.set(null)
    await goto('/mail')
  }

  function handleFileSelect() {
    const files = fileInput?.files
    if (!files) return
    const newFiles = Array.from(files).map(file => ({
      id: `${Date.now()}-${attachCounter++}`,
      file,
    }))
    attachments = [...attachments, ...newFiles]
    if (fileInput) fileInput.value = ''
  }

  function removeAttachment(id: string) {
    attachments = attachments.filter(a => a.id !== id)
  }
</script>

<div class="composer">
  <div class="composer-toolbar">
    <span class="composer-title">New Message</span>
    <div class="toolbar-actions">
      <button
        class="send-btn"
        onclick={handleSend}
        disabled={sending || !toRaw.trim() || !identity?.id}
      >
        {sending ? 'Sending…' : '➤ Send'}
      </button>
      <button class="discard-btn" onclick={handleDiscard}>Discard</button>
    </div>
  </div>

  {#if sendError}
    <div class="error-bar">{sendError}</div>
  {/if}

  <div class="fields">
    {#if $identities.length > 1}
      <div class="field-row">
        <label for="compose-from">From</label>
        <div>{identity?.name} &lt;{store.user.profile.email}&gt;</div>
      </div>
    {:else if identity}
      <div class="field-row">
        <span class="field-label">From</span>
        <span class="field-static">{identity?.name} &lt;{store.user.profile.email}&gt;</span>
      </div>
    {/if}

    <div class="field-row">
      <label for="compose-to">To</label>
      <input id="compose-to" type="text" bind:value={toRaw} placeholder="Recipient(s)…" />
      <div class="field-extras">
        {#if !showCc}
          <button class="extra-btn" onclick={() => (showCc = true)}>Cc</button>
        {/if}
        {#if !showBcc}
          <button class="extra-btn" onclick={() => (showBcc = true)}>Bcc</button>
        {/if}
      </div>
    </div>

    {#if showCc}
      <div class="field-row">
        <label for="compose-cc">Cc</label>
        <input id="compose-cc" type="text" bind:value={ccRaw} placeholder="CC recipients…" />
      </div>
    {/if}

    {#if showBcc}
      <div class="field-row">
        <label for="compose-bcc">Bcc</label>
        <input id="compose-bcc" type="text" bind:value={bccRaw} placeholder="BCC recipients…" />
      </div>
    {/if}

    <div class="field-row">
      <label for="compose-subject">Subject</label>
      <input id="compose-subject" type="text" bind:value={subject} placeholder="Subject…" />
    </div>
  </div>

  <div class="attachments-bar">
    <input
      type="file"
      multiple
      bind:this={fileInput}
      onchange={handleFileSelect}
      style="display: none;"
    />
    <button type="button" class="attach-btn" onclick={() => fileInput?.click()}>
      📎 Attach
    </button>
    {#if attachments.length > 0}
      <div class="attach-list">
        {#each attachments as att (att.id)}
          <span class="attach-chip">
            {att.file.name}
            <button
              type="button"
              class="attach-remove"
              onclick={() => removeAttachment(att.id)}
              title="Remove"
            >✕</button>
          </span>
        {/each}
      </div>
    {/if}
  </div>

  <div class="body-area">
    <textarea
      bind:value={body}
      placeholder="Write your message…"
      class="body-textarea"
    ></textarea>
  </div>
</div>

<style>
  .composer {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-color);
    overflow: hidden;
  }

  .composer-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .composer-title {
    font-weight: 600;
    font-size: 1.15rem;
    color: var(--color-darkGrey, #1b2433);
  }

  .toolbar-actions {
    display: flex;
    gap: 0.5rem;
  }

  .send-btn {
    background: var(--color-primary, #2f63f0);
    color: var(--color-darkGrey);
    border: none;
    border-radius: 5px;
    padding: 0.45rem 1rem;
    cursor: pointer;
    font-size: 1.03rem;
    font-weight: 600;
    transition: background 0.15s;
  }

  .send-btn:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  .send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .discard-btn {
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    color: var(--color-grey, #60708a);
    cursor: pointer;
    font-size: 1.03rem;
    padding: 0.45rem 0.75rem;
    transition: color 0.15s, border-color 0.15s;
  }

  .discard-btn:hover {
    color: var(--color-error, #d43939);
    border-color: var(--color-error, #d43939);
  }

  .error-bar {
    background: var(--bg-error);
    border-bottom: 1px solid var(--color-error);
    color: var(--color-error, #d43939);
    font-size: 1.01rem;
    padding: 0.5rem 1rem;
    flex-shrink: 0;
  }

  .fields {
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  .field-row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    padding: 0 1rem;
  }

  .field-row:last-child {
    border-bottom: none;
  }

  label, .field-label {
    width: 4.5rem;
    flex-shrink: 0;
    font-size: 0.98rem;
    font-weight: 600;
    color: var(--color-grey, #60708a);
    padding: 0.6rem 0;
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 1.03rem;
    padding: 0.6rem 0;
    background: transparent;
    color: var(--font-color, #333333);
  }

  .field-static {
    flex: 1;
    font-size: 1.03rem;
    color: var(--font-color, #333333);
    padding: 0.6rem 0;
  }

  .field-extras {
    display: flex;
    gap: 0.25rem;
  }

  .extra-btn {
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 3px;
    color: var(--color-grey, #60708a);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.15rem 0.4rem;
    transition: color 0.1s, border-color 0.1s;
  }

  .extra-btn:hover {
    color: var(--color-primary, #2f63f0);
    border-color: var(--color-primary, #2f63f0);
  }

  .body-area {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .body-textarea {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    padding: 1rem;
    font-size: 1.03rem;
    font-family: inherit;
    line-height: 1.6;
    color: var(--font-color, #333333);
    background: transparent;
  }

  .attachments-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
    background: var(--bg-secondary-color, #f5f7fb);
    overflow-x: auto;
  }

  .attach-btn {
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    color: var(--color-grey, #60708a);
    cursor: pointer;
    font-size: 0.98rem;
    padding: 0.3rem 0.6rem;
    transition: color 0.1s, border-color 0.1s;
    flex-shrink: 0;
  }

  .attach-btn:hover {
    color: var(--color-primary, #2f63f0);
    border-color: var(--color-primary, #2f63f0);
  }

  .attach-list {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .attach-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: var(--bg-color);
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    padding: 0.2rem 0.5rem;
    font-size: 0.92rem;
    color: var(--font-color, #333333);
  }

  .attach-remove {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-grey, #60708a);
    font-size: 0.86rem;
    padding: 0 0.1rem;
    line-height: 1;
  }

  .attach-remove:hover {
    color: var(--color-error, #d43939);
  }
</style>
