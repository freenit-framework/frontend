<script lang="ts">
  import { jabberStore } from '$lib/jabber/store.svelte'

  let messageText = $state('')

  const messages = $derived.by(() => {
    if (!jabberStore.selectedJid) return []
    return jabberStore.getMessages(jabberStore.selectedJid)
  })

  async function send() {
    const text = messageText.trim()
    if (!text || !jabberStore.selectedJid) return
    if (jabberStore.selectedIsRoom) {
      await jabberStore.sendRoomMessage(jabberStore.selectedJid, text)
    } else {
      await jabberStore.sendMessage(jabberStore.selectedJid, text)
    }
    messageText = ''
  }

  function isOmemoEnabled(): boolean {
    return jabberStore.selectedJid ? jabberStore.isOmemoEnabled(jabberStore.selectedJid) : false
  }

  function toggleOmemo() {
    if (!jabberStore.selectedJid) return
    jabberStore.toggleOmemo(jabberStore.selectedJid)
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function chatTitle(): string {
    if (!jabberStore.selectedJid) return ''
    if (jabberStore.selectedIsRoom) {
      return jabberStore.rooms.find(r => r.jid === jabberStore.selectedJid)?.name || jabberStore.selectedJid
    }
    return jabberStore.roster.find(r => r.jid === jabberStore.selectedJid)?.name || jabberStore.selectedJid
  }
</script>

<div class="chat-panel">
  {#if !jabberStore.selectedJid}
    <div class="empty">
      <p>Select a contact or room to start chatting</p>
    </div>
  {:else}
    <div class="chat-header">
      <span class="chat-with">{chatTitle()}</span>
      <span class="chat-jid">{jabberStore.selectedJid}</span>
      {#if jabberStore.selectedIsRoom}
        <span class="chat-badge">room</span>
      {/if}
      {#if !jabberStore.selectedIsRoom}
        <button
          class="omemo-toggle"
          class:active={isOmemoEnabled()}
          onclick={toggleOmemo}
          title={isOmemoEnabled() ? 'OMEMO encryption enabled' : 'OMEMO encryption disabled'}
        >
          {isOmemoEnabled() ? '🔒' : '🔓'}
        </button>
      {/if}
    </div>

    <div class="messages">
      {#if jabberStore.isHistoryLoading(jabberStore.selectedJid)}
        <div class="loading-history">Loading history…</div>
      {:else if messages.length === 0}
        <div class="no-messages">No messages yet</div>
      {:else}
        {#each messages as msg (msg.id)}
          <div class="message" class:incoming={msg.incoming} class:outgoing={!msg.incoming}>
            <div class="bubble">
              {#if msg.type === 'groupchat'}
                <div class="sender">{msg.from}</div>
              {/if}
              <div class="body" class:failed={msg.decryptionFailed}>
                {msg.body}
                {#if msg.encrypted}
                  <span class="lock" title="OMEMO encrypted">🔒</span>
                {/if}
              </div>
              <div class="meta">{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <div class="composer">
      <textarea
        bind:value={messageText}
        onkeydown={handleKey}
        placeholder="Type a message…"
        rows={2}
        disabled={!jabberStore.connected}
      ></textarea>
      <button onclick={send} disabled={!jabberStore.connected || !messageText.trim()}>
        Send
      </button>
    </div>
  {/if}
</div>

<style>
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-color);
    overflow: hidden;
  }

  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-grey, #60708a);
    font-size: 1.09rem;
  }

  .chat-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .chat-with {
    font-weight: 600;
    font-size: 1.15rem;
    color: var(--font-color, #333333);
  }

  .chat-jid {
    font-size: 0.92rem;
    color: var(--color-grey, #60708a);
  }

  .chat-badge {
    font-size: 0.8rem;
    background: var(--color-primary, #2f63f0);
    color: var(--color-darkGrey);
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    align-self: flex-start;
    margin-top: 0.2rem;
  }

  .omemo-toggle {
    align-self: flex-start;
    background: none;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 5px;
    padding: 0.2rem 0.4rem;
    cursor: pointer;
    font-size: 1.03rem;
    margin-top: 0.2rem;
  }

  .omemo-toggle.active {
    background: var(--color-success, #28bd14);
    border-color: var(--color-success, #28bd14);
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .no-messages,
  .loading-history {
    text-align: center;
    color: var(--color-grey, #60708a);
    padding: 2rem;
    font-size: 1.03rem;
  }

  .message {
    display: flex;
  }

  .message.incoming {
    justify-content: flex-start;
  }

  .message.outgoing {
    justify-content: flex-end;
  }

  .bubble {
    max-width: 70%;
    padding: 0.6rem 0.9rem;
    border-radius: 12px;
    font-size: 1.03rem;
    line-height: 1.4;
    word-break: break-word;
  }

  .incoming .bubble {
    background: var(--bg-secondary-color, #f5f7fb);
    color: var(--font-color, #333333);
    border-bottom-left-radius: 4px;
  }

  .outgoing .bubble {
    background: var(--color-primary, #2f63f0);
    color: var(--color-darkGrey);
    border-bottom-right-radius: 4px;
  }

  .bubble .sender {
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--color-primary, #2f63f0);
    margin-bottom: 0.2rem;
  }

  .outgoing .bubble .sender {
    color: rgba(255, 255, 255, 0.8);
  }

  .bubble .meta {
    font-size: 0.8rem;
    margin-top: 0.3rem;
    opacity: 0.7;
    text-align: right;
  }

  .bubble .body .lock {
    margin-left: 0.3rem;
    font-size: 0.86rem;
  }

  .bubble .body.failed {
    font-style: italic;
    opacity: 0.7;
  }

  .composer {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
    background: var(--bg-color);
  }

  .composer textarea {
    flex: 1;
    resize: none;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 8px;
    font-size: 1.03rem;
    font-family: inherit;
  }

  .composer textarea:focus {
    outline: none;
    border-color: var(--color-primary, #2f63f0);
  }

  .composer button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 8px;
    background: var(--color-primary, #2f63f0);
    color: var(--color-darkGrey);
    font-size: 1.03rem;
    cursor: pointer;
    transition: background 0.1s;
  }

  .composer button:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  .composer button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
