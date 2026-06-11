<script lang="ts">
  import type { Email } from '$lib/mail/types'

  interface Props {
    email: Email
    selected: boolean
    onclick: () => void
  }

  let { email, selected, onclick }: Props = $props()

  const isUnread = $derived(!email.keywords['$seen'])
  const isStarred = $derived(!!email.keywords['$flagged'])

  const sender = $derived.by(() => {
    const f = email.from?.[0]
    if (!f) return 'Unknown'
    return f.name || f.email
  })

  const date = $derived.by(() => {
    const d = new Date(email.receivedAt)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    const isThisYear = d.getFullYear() === now.getFullYear()
    if (isThisYear) {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
    return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
  })
</script>

<button class="item" class:selected class:unread={isUnread} {onclick}>
  <div class="item-top">
    <span class="sender" class:bold={isUnread}>{sender}</span>
    <span class="date">{date}</span>
  </div>
  <div class="subject" class:bold={isUnread}>
    {email.subject || '(no subject)'}
  </div>
  <div class="preview">{email.preview || ''}</div>
  <div class="flags">
    {#if email.hasAttachment}<span title="Has attachment">📎</span>{/if}
    {#if isStarred}<span title="Starred">⭐</span>{/if}
  </div>
</button>

<style>
  .item {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
    position: relative;
  }

  .item:hover {
    background: rgba(47, 99, 240, 0.05);
  }

  .item.selected {
    background: rgba(47, 99, 240, 0.1);
    border-left: 3px solid var(--color-primary, #2f63f0);
  }

  .item-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.2rem;
  }

  .sender {
    font-size: 0.9rem;
    color: var(--color-darkGrey, #1b2433);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .bold {
    font-weight: 700;
  }

  .date {
    font-size: 0.78rem;
    color: var(--color-grey, #60708a);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .subject {
    font-size: 0.875rem;
    color: var(--color-darkGrey, #1b2433);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.15rem;
  }

  .preview {
    font-size: 0.8rem;
    color: var(--color-grey, #60708a);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .flags {
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
    font-size: 0.75rem;
    display: flex;
    gap: 0.2rem;
  }
</style>
