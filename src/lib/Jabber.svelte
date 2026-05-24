<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import store from '$lib/store'
  import { jabberStore } from './jabber/store.svelte'
  import RosterList from './components/jabber/RosterList.svelte'
  import ChatPanel from './components/jabber/ChatPanel.svelte'

  let wsURL = $state('')

  onMount(async () => {
    await jabberStore.fetchConfig()
    wsURL = jabberStore.wsURL
    const email = store.user.profile?.email
    if (email) {
      jabberStore.connect(email, wsURL || undefined)
    }
  })

  onDestroy(() => {
    jabberStore.disconnect()
  })

  function reconnect() {
    const email = store.user.profile?.email
    if (email) {
      jabberStore.connect(email, wsURL || undefined)
    }
  }
</script>

<div class="jabber-shell">
  <div class="jabber-toolbar">
    <div class="connection-status">
      {#if jabberStore.connecting}
        <span class="status connecting">Connecting…</span>
      {:else if jabberStore.connected}
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
        disabled={jabberStore.connected || jabberStore.connecting}
      />
      {#if jabberStore.connected}
        <button onclick={() => jabberStore.disconnect()}>Disconnect</button>
      {:else}
        <button onclick={reconnect} disabled={jabberStore.connecting}>
          {jabberStore.connecting ? 'Connecting…' : 'Connect'}
        </button>
      {/if}
    </div>
  </div>

  {#if jabberStore.error && !jabberStore.connecting}
    <div class="global-error">
      {jabberStore.error}
      {#if jabberStore.attemptedURL}
        <div class="url">{jabberStore.attemptedURL}</div>
      {/if}
    </div>
  {/if}

  <div class="jabber-layout">
    <div class="jabber-sidebar">
      <RosterList />
    </div>
    <div class="jabber-chat">
      <ChatPanel />
    </div>
  </div>
</div>

<style>
  .jabber-shell {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .jabber-toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    background: var(--bg-secondary-color, #f5f7fb);
    flex-shrink: 0;
  }

  .connection-status {
    font-size: 0.85rem;
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
    font-size: 0.875rem;
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
    background: white;
    color: var(--color-darkGrey, #1b2433);
    font-size: 0.875rem;
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
    background: #fff0f0;
    color: var(--color-error, #d43939);
    font-size: 0.85rem;
    border-bottom: 1px solid #fcc;
    flex-shrink: 0;
  }

  .global-error .url {
    font-family: monospace;
    font-size: 0.8rem;
    margin-top: 0.2rem;
    opacity: 0.8;
  }

  .jabber-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .jabber-sidebar {
    width: 260px;
    flex-shrink: 0;
    overflow: hidden;
  }

  .jabber-chat {
    flex: 1;
    overflow: hidden;
  }
</style>
