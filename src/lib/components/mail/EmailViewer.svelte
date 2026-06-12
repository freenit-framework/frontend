<script lang="ts">
  import { goto } from '$app/navigation'
  import {
    selectedEmailId,
    emailContent,
    emails,
    deleteEmail,
    composeParams,
    identities,
    mailboxes,
    moveEmail,
  } from '$lib/mail/store'
  import { getEffectiveTheme } from '$lib/theme.svelte'
  import type { EmailAddress } from '$lib/mail/types'

  const email = $derived(
    $selectedEmailId ? ($emailContent[$selectedEmailId] ?? $emails.find(e => e.id === $selectedEmailId) ?? null) : null
  )

  const hasFullContent = $derived(email !== null && email.bodyValues !== undefined)

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatAddresses(addrs?: EmailAddress[]): string {
    if (!addrs?.length) return ''
    return addrs.map(a => (a.name ? `${a.name} <${a.email}>` : a.email)).join(', ')
  }

  const htmlBody = $derived.by(() => {
    if (!email?.bodyValues || !email.htmlBody?.length) return null
    const part = email.htmlBody[0]
    if (!part.partId) return null
    return email.bodyValues[part.partId]?.value ?? null
  })

  const textBody = $derived.by(() => {
    if (!email?.bodyValues || !email.textBody?.length) return null
    const part = email.textBody[0]
    if (!part.partId) return null
    return email.bodyValues[part.partId]?.value ?? null
  })

  function buildEmailSrcdoc(html: string): string {
    const isDark = getEffectiveTheme() === 'dark'
    const textColor = isDark ? '#e0e6ed' : '#333333'
    const bgColor = isDark ? '#1b2433' : '#ffffff'
    const linkColor = isDark ? '#7aa2ff' : '#2f63f0'

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      :root { color-scheme: ${isDark ? 'dark' : 'light'}; }
      body {
        margin: 0;
        padding: 1rem;
        color: ${textColor};
        background-color: ${bgColor};
        font-family: sans-serif;
        line-height: 1.5;
      }
      a { color: ${linkColor}; }
      img { max-width: 100%; height: auto; }
    </style>
  </head>
  <body>${html}</body>
</html>`
  }

  const htmlSrcdoc = $derived.by(() => {
    if (!htmlBody) return ''
    return buildEmailSrcdoc(htmlBody)
  })

  async function downloadAttachment(blobId: string, name: string) {
    const accountId = email?.mailboxIds ? Object.keys(email.mailboxIds)[0] : ''
    const url = `/api/v1/mail/jmap/download/${encodeURIComponent(accountId)}/${encodeURIComponent(blobId)}/${encodeURIComponent(name)}`
    const response = await fetch(url)
    if (!response.ok) return
    const blob = await response.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function handleReply() {
    if (!email) return
    const replyTo = email.replyTo?.length ? email.replyTo : email.from ?? []

    composeParams.set({
      to: replyTo,
      subject: email.subject?.startsWith('Re:') ? email.subject : `Re: ${email.subject ?? ''}`,
      inReplyTo: [email.id],
      references: [...(email.references ?? []), email.id],
      replyToEmail: email,
    })
    await goto('/mail/compose')
  }

  async function handleReplyAll() {
    if (!email) return
    const myIdentity = $identities[0]
    const myEmail = myIdentity?.email ?? ''

    const replyTo = (email.replyTo?.length ? email.replyTo : email.from) ?? []
    const allTo = [...replyTo, ...(email.to ?? [])].filter(a => a.email !== myEmail)
    const cc = (email.cc ?? []).filter(a => a.email !== myEmail)

    composeParams.set({
      to: allTo,
      cc,
      subject: email.subject?.startsWith('Re:') ? email.subject : `Re: ${email.subject ?? ''}`,
      inReplyTo: [email.id],
      references: [...(email.references ?? []), email.id],
      replyToEmail: email,
    })
    await goto('/mail/compose')
  }

  async function handleForward() {
    if (!email) return
    composeParams.set({
      subject: email.subject?.startsWith('Fwd:') ? email.subject : `Fwd: ${email.subject ?? ''}`,
      replyToEmail: email,
    })
    await goto('/mail/compose')
  }

  async function handleDelete() {
    if (!email) return
    await deleteEmail(email.id)
  }

  async function handleArchive() {
    if (!email) return
    const archiveId = $mailboxes.find(m => m.role === 'archive')?.id
    if (archiveId) await moveEmail(email.id, archiveId)
  }


</script>

<div class="viewer">
  {#if !email}
    <div class="empty">
      <div class="empty-icon">✉</div>
      <p>Select an email to read</p>
    </div>
  {:else}
    <div class="viewer-header">
      <div class="subject-row">
        <h2 class="subject">{email.subject || '(no subject)'}</h2>
        <div class="actions">
          <button class="action-btn" title="Reply" onclick={handleReply}>↩ Reply</button>
          <button class="action-btn" title="Reply All" onclick={handleReplyAll}>↩ All</button>
          <button class="action-btn" title="Forward" onclick={handleForward}>↪ Forward</button>
          <button class="action-btn" title="Archive" onclick={handleArchive}>📦</button>
          <button class="action-btn danger" title="Delete" onclick={handleDelete}>🗑</button>
        </div>
      </div>

      <div class="meta">
        <div class="meta-row">
          <span class="meta-label">From:</span>
          <span class="meta-value">{formatAddresses(email.from)}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">To:</span>
          <span class="meta-value">{formatAddresses(email.to)}</span>
        </div>
        {#if email.cc?.length}
          <div class="meta-row">
            <span class="meta-label">CC:</span>
            <span class="meta-value">{formatAddresses(email.cc)}</span>
          </div>
        {/if}
        <div class="meta-row">
          <span class="meta-label">Date:</span>
          <span class="meta-value">{formatDate(email.receivedAt)}</span>
        </div>
      </div>

      {#if email.attachments?.length}
        <div class="attachments">
          <span class="attach-label">📎 Attachments:</span>
          {#each email.attachments as att (att.blobId ?? att.name)}
            {#if att.blobId}
              <button
                class="attach-link"
                onclick={() => downloadAttachment(att.blobId!, att.name ?? 'attachment')}
              >
                {att.name ?? 'attachment'}
                {#if att.size}
                  <span class="attach-size">({Math.round(att.size / 1024)}KB)</span>
                {/if}
              </button>
            {/if}
          {/each}
        </div>
      {/if}
    </div>

    <div class="body-area">
      {#if !hasFullContent}
        <div class="loading-body">Loading message…</div>
      {:else if htmlBody}
        <iframe
          title="Email content"
          srcdoc={htmlSrcdoc}
          sandbox="allow-same-origin"
          class="html-frame"
        ></iframe>
      {:else if textBody}
        <pre class="text-body">{textBody}</pre>
      {:else}
        <p class="no-body">No message body</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .viewer {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-color);
    overflow: hidden;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-grey, #60708a);
    gap: 0.75rem;
  }

  .empty-icon {
    font-size: 3rem;
    opacity: 0.4;
  }

  .empty p {
    margin: 0;
    font-size: 0.95rem;
  }

  .viewer-header {
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    padding: 1rem 1.25rem;
    flex-shrink: 0;
  }

  .subject-row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .subject {
    flex: 1;
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--font-color, #333333);
    line-height: 1.3;
    word-break: break-word;
  }

  .actions {
    display: flex;
    gap: 0.4rem;
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .action-btn {
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    color: var(--font-color, #333333);
    cursor: pointer;
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    transition: background 0.1s, border-color 0.1s;
    white-space: nowrap;
  }

  .action-btn:hover {
    background: var(--bg-secondary-color, #f5f7fb);
    border-color: var(--color-grey, #60708a);
  }

  .action-btn.danger:hover {
    background: var(--bg-error);
    border-color: var(--color-error, #d43939);
    color: var(--color-error, #d43939);
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .meta-row {
    display: flex;
    gap: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .meta-label {
    color: var(--color-grey, #60708a);
    font-weight: 600;
    width: 3.5rem;
    flex-shrink: 0;
  }

  .meta-value {
    color: var(--font-color, #333333);
    word-break: break-all;
  }

  .attachments {
    margin-top: 0.75rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .attach-label {
    font-size: 0.85rem;
    color: var(--color-grey, #60708a);
    font-weight: 600;
  }

  .attach-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.85rem;
    padding: 0.25rem 0.6rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    color: var(--color-primary, #2f63f0);
    text-decoration: none;
    transition: background 0.1s;
  }

  .attach-link:hover {
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .attach-size {
    color: var(--color-grey, #60708a);
    font-size: 0.8rem;
  }

  .body-area {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .loading-body {
    padding: 2rem;
    color: var(--color-grey, #60708a);
    font-size: 0.9rem;
  }

  .html-frame {
    width: 100%;
    height: 100%;
    border: none;
    flex: 1;
    display: block;
  }

  .text-body {
    flex: 1;
    padding: 1.25rem;
    margin: 0;
    font-family: var(--font-family-mono, monospace);
    font-size: 0.875rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-y: auto;
    color: var(--font-color, #333333);
  }

  .no-body {
    padding: 2rem;
    color: var(--color-grey, #60708a);
    font-size: 0.9rem;
  }
</style>
