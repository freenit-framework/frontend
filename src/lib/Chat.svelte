<script lang="ts">
  import store from '$lib/store'
  import { chatStore } from './chat/store.svelte'
  import RosterList from './components/chat/RosterList.svelte'
  import ChatPanel from './components/chat/ChatPanel.svelte'

  let wsURL = $state(chatStore.wsURL)

  function reconnect() {
    const email = store.user.profile?.email
    if (email) {
      chatStore.connect(email, wsURL || undefined)
    }
  }

  function callPeerName(): string {
    const jid = chatStore.callState.peerJid
    if (!jid) return ''
    return chatStore.roster.find((r) => r.jid === jid)?.name || jid
  }
</script>

<div class="chat-shell">
  <div class="chat-toolbar">
    <div class="connection-status">
      {#if chatStore.connecting}
        <span class="status connecting">Connecting…</span>
      {:else if chatStore.connected}
        <span class="status connected">Connected</span>
      {:else}
        <span class="status disconnected">Disconnected</span>
      {/if}
    </div>
    <div class="server-config">
      <input
        type="text"
        placeholder="wss://xmpp.example.com:5443/ws"
        bind:value={wsURL}
        disabled={chatStore.connected || chatStore.connecting}
      />
      {#if chatStore.connected}
        <button onclick={() => chatStore.disconnect()}>Disconnect</button>
      {:else}
        <button onclick={reconnect} disabled={chatStore.connecting}>
          {chatStore.connecting ? 'Connecting…' : 'Connect'}
        </button>
      {/if}
    </div>
  </div>

  {#if chatStore.error && !chatStore.connecting}
    <div class="global-error">
      {chatStore.error}
      {#if chatStore.attemptedURL}
        <div class="url">{chatStore.attemptedURL}</div>
      {/if}
    </div>
  {/if}

  {#if chatStore.callState.status !== 'idle'}
    <div class="call-overlay">
      <div class="call-card">
        <div class="call-peer">{callPeerName()}</div>
        <div class="call-status">
          {#if chatStore.callState.status === 'incoming'}Incoming audio call{/if}
          {#if chatStore.callState.status === 'outgoing'}Calling…{/if}
          {#if chatStore.callState.status === 'connected'}Connected{/if}
        </div>
        <div class="call-actions">
          {#if chatStore.callState.status === 'incoming'}
            <button
              class="button primary"
              onclick={() => chatStore.callState.peerJid && chatStore.acceptAudioCall(chatStore.callState.peerJid)}
            >
              Accept
            </button>
            <button
              class="button error"
              onclick={() => chatStore.callState.peerJid && chatStore.rejectAudioCall(chatStore.callState.peerJid)}
            >
              Reject
            </button>
          {:else}
            <button class="button error" onclick={() => chatStore.endAudioCall()}>End call</button>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if chatStore.callState.localStream}
    <audio autoplay muted playsinline srcObject={chatStore.callState.localStream}></audio>
  {/if}
  {#if chatStore.callState.remoteStream}
    <audio autoplay playsinline srcObject={chatStore.callState.remoteStream}></audio>
  {/if}

  <div class="chat-layout">
    <div class="chat-sidebar">
      <RosterList />
    </div>
    <div class="chat-chat">
      <ChatPanel />
    </div>
  </div>
</div>

<style>
  .chat-shell {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .chat-toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-secondary-color, #f5f7fb);
    flex-shrink: 0;
  }

  .connection-status {
    font-size: 0.98rem;
    font-weight: 600;
    min-width: 7rem;
  }

  .status.connecting {
    color: var(--color-warning, #e6a23c);
  }

  .status.connected {
    color: var(--color-success, #3bb273);
  }

  .status.disconnected {
    color: var(--color-grey, #60708a);
  }

  .server-config {
    display: flex;
    gap: 0.5rem;
    flex: 1;
    align-items: center;
  }

  .server-config input {
    flex: 1;
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    font-size: 1.01rem;
    font-family: monospace;
  }

  .server-config input:focus {
    outline: none;
    border-color: var(--color-primary, #2f63f0);
  }

  .server-config button {
    padding: 0.4rem 0.8rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    background: var(--bg-color);
    color: var(--font-color, #333333);
    font-size: 1.01rem;
    cursor: pointer;
    transition: background 0.1s;
  }

  .server-config button:hover:not(:disabled) {
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .server-config button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .global-error {
    padding: 0.5rem 1rem;
    background: var(--bg-error);
    color: var(--color-error, #d43939);
    font-size: 0.98rem;
    border-bottom: 1px solid var(--color-error);
    flex-shrink: 0;
  }

  .global-error .url {
    font-family: monospace;
    font-size: 0.92rem;
    margin-top: 0.2rem;
    opacity: 0.8;
  }

  .call-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    z-index: 100;
  }

  .call-card {
    background: var(--bg-color);
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 8px;
    padding: 1.5rem;
    min-width: 280px;
    text-align: center;
  }

  .call-peer {
    font-weight: 600;
    font-size: 1.2rem;
    margin-bottom: 0.25rem;
  }

  .call-status {
    color: var(--color-grey, #60708a);
    margin-bottom: 1rem;
  }

  .call-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }

  audio {
    display: none;
  }

  .chat-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .chat-sidebar {
    width: 260px;
    flex-shrink: 0;
    overflow: hidden;
  }

  .chat-chat {
    flex: 1;
    overflow: hidden;
  }
</style>
