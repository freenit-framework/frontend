<script lang="ts">
  import { jabberStore } from '$lib/jabber/store.svelte'

  let messageText = $state('')

  const messages = $derived(() => {
    if (!jabberStore.selectedJid) return []
    return jabberStore.getMessages(jabberStore.selectedJid)
  })

  function send() {
    const text = messageText.trim()
    if (!text || !jabberStore.selectedJid) return
    if (jabberStore.selectedIsRoom) {
      jabberStore.sendRoomMessage(jabberStore.selectedJid, text)
    } else {
      jabberStore.sendMessage(jabberStore.selectedJid, text)
    }
    messageText = ''
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
    </div>

    <div class="messages">
      {#if messages().length === 0}
        <div class="no-messages">No messages yet</div>
      {:else}
        {#each messages() as msg (msg.id)}
          <div class="message" class:incoming={msg.incoming} class:outgoing={!msg.incoming}>
            <div class="bubble">
              {#if msg.type === 'groupchat'}
                <div class="sender">{msg.from}</div>
              {/if}
              <div class="body">{msg.body}</div>
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
    font-size: 0.95rem;
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
    font-size: 1rem;
    color: var(--font-color, #333333);
  }

  .chat-jid {
    font-size: 0.8rem;
    color: var(--color-grey, #60708a);
  }

  .chat-badge {
    font-size: 0.7rem;
    background: var(--color-primary, #2f63f0);
    color: white;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    align-self: flex-start;
    margin-top: 0.2rem;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .no-messages {
    text-align: center;
    color: var(--color-grey, #60708a);
    padding: 2rem;
    font-size: 0.9rem;
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
    font-size: 0.9rem;
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
    color: white;
    border-bottom-right-radius: 4px;
  }

  .bubble .sender {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-primary, #2f63f0);
    margin-bottom: 0.2rem;
  }

  .outgoing .bubble .sender {
    color: rgba(255, 255, 255, 0.8);
  }

  .bubble .meta {
    font-size: 0.7rem;
    margin-top: 0.3rem;
    opacity: 0.7;
    text-align: right;
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
    font-size: 0.9rem;
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
    color: white;
    font-size: 0.9rem;
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
