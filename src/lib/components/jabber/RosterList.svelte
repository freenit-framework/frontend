<script lang="ts">
  import { jabberStore } from '$lib/jabber/store.svelte'
  import type { RosterItem } from '$lib/jabber/types'

  let searchQuery = $state('')
  let showJoinRoom = $state(false)
  let roomJid = $state('')
  let roomNick = $state('')

  const filteredRoster = $derived.by(() => {
    const query = searchQuery.trim().toLowerCase()
    const selfJid = jabberStore.myJid
    let items = query
      ? jabberStore.roster.filter(
          r =>
            r.jid.toLowerCase().includes(query) ||
            (r.name && r.name.toLowerCase().includes(query))
        )
      : [...jabberStore.roster]

    if (selfJid && !items.some((r) => r.jid === selfJid)) {
      items.push({ jid: selfJid, name: 'Me', subscription: 'both', presence: 'available', status: '' })
    }

    items.sort((a, b) => {
      if (a.jid === selfJid) return -1
      if (b.jid === selfJid) return 1
      const aName = (a.name || a.jid).toLowerCase()
      const bName = (b.name || b.jid).toLowerCase()
      return aName.localeCompare(bName)
    })

    return items
  })

  const filteredRooms = $derived(
    searchQuery.trim()
      ? jabberStore.rooms.filter(
          r =>
            r.jid.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : jabberStore.rooms
  )

  function presenceDot(presence?: string): string {
    switch (presence) {
      case 'available': return '🟢'
      case 'away': return '🟡'
      case 'dnd': return '🔴'
      case 'xa': return '⚪'
      default: return '⚫'
    }
  }

  function displayName(item: RosterItem): string {
    return item.name || item.jid
  }

  function toggleJoinRoom() {
    showJoinRoom = !showJoinRoom
    if (showJoinRoom) {
      const localpart = jabberStore.myJid.split('@')[0]
      roomNick = localpart || 'user'
    }
  }

  async function doJoinRoom() {
    if (!roomJid.trim() || !roomNick.trim()) return
    await jabberStore.joinRoom(roomJid.trim(), roomNick.trim())
    showJoinRoom = false
    roomJid = ''
  }
</script>

<div class="roster">
  <div class="roster-header">
    <h3>Contacts</h3>
    <span class="count">{filteredRoster.length}</span>
  </div>

  <div class="search-bar">
    <input
      type="search"
      placeholder="Search contacts…"
      bind:value={searchQuery}
      aria-label="Search contacts"
    />
  </div>

  {#if jabberStore.error && !jabberStore.connected}
    <div class="error-bar">{jabberStore.error}</div>
  {/if}

  {#if filteredRoster.length === 0}
    <div class="status">
      {jabberStore.connected ? 'No contacts' : 'Not connected'}
    </div>
  {:else}
    <div class="list-body">
      {#each filteredRoster as item (item.jid)}
        <button
          class="roster-item"
          class:selected={jabberStore.selectedJid === item.jid && !jabberStore.selectedIsRoom}
          onclick={() => jabberStore.selectJid(item.jid, false)}
        >
          <span class="presence">{presenceDot(item.presence)}</span>
          <div class="info">
            <div class="name">{displayName(item)}</div>
            <div class="jid">{item.jid}</div>
            {#if item.status}
              <div class="status-text">{item.status}</div>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  {/if}

  <div class="rooms-header">
    <h3>Rooms</h3>
    <button class="join-btn" onclick={toggleJoinRoom} title="Join room">+</button>
  </div>

  {#if showJoinRoom}
    <div class="join-form">
      <input
        type="text"
        placeholder="room@conference.example.com"
        bind:value={roomJid}
      />
      <input
        type="text"
        placeholder="Nickname"
        bind:value={roomNick}
      />
      <div class="join-actions">
        <button onclick={doJoinRoom}>Join</button>
        <button onclick={() => showJoinRoom = false}>Cancel</button>
      </div>
    </div>
  {/if}

  {#if filteredRooms.length === 0}
    <div class="status small">No rooms joined</div>
  {:else}
    <div class="list-body">
      {#each filteredRooms as room (room.jid)}
        <button
          class="roster-item"
          class:selected={jabberStore.selectedJid === room.jid && jabberStore.selectedIsRoom}
          onclick={() => jabberStore.selectJid(room.jid, true)}
        >
          <span class="presence">{room.joined ? '🟢' : '🟡'}</span>
          <div class="info">
            <div class="name">{room.name || room.jid}</div>
            <div class="jid">{room.jid}</div>
          </div>
          <span
            class="leave-btn"
            onclick={(e) => { e.stopPropagation(); jabberStore.leaveRoom(room.jid) }}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); jabberStore.leaveRoom(room.jid) } }}
            role="button"
            tabindex={0}
            title="Leave room"
          >×</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .roster {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-right: 1px solid var(--color-lightGrey, #d9e0eb);
    overflow: hidden;
    background: var(--bg-color);
  }

  .roster-header,
  .rooms-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  .rooms-header {
    border-top: 1px solid var(--color-lightGrey, #d9e0eb);
    margin-top: auto;
  }

  h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--font-color, #333333);
    flex: 1;
  }

  .count {
    font-size: 0.92rem;
    color: var(--color-grey, #60708a);
  }

  .join-btn {
    background: var(--color-primary, #2f63f0);
    color: var(--color-darkGrey);
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 1.15rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .join-form {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .join-form input {
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    font-size: 0.98rem;
  }

  .join-actions {
    display: flex;
    gap: 0.4rem;
  }

  .join-actions button {
    flex: 1;
    padding: 0.3rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    background: var(--bg-color);
    color: var(--font-color, #333333);
    font-size: 0.92rem;
    cursor: pointer;
  }

  .join-actions button:first-child {
    background: var(--color-primary, #2f63f0);
    color: var(--color-darkGrey);
    border-color: var(--color-primary, #2f63f0);
  }

  .search-bar {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    flex-shrink: 0;
  }

  .search-bar input {
    width: 100%;
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--color-lightGrey, #d9e0eb);
    border-radius: 4px;
    font-size: 1.01rem;
    box-sizing: border-box;
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .search-bar input:focus {
    outline: none;
    border-color: var(--color-primary, #2f63f0);
  }

  .error-bar {
    padding: 0.5rem 1rem;
    background: var(--bg-error);
    color: var(--color-error, #d43939);
    font-size: 0.98rem;
    border-bottom: 1px solid var(--color-error);
    flex-shrink: 0;
  }

  .status {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--color-grey, #60708a);
    font-size: 1.03rem;
  }

  .status.small {
    padding: 1rem;
    font-size: 0.98rem;
  }

  .list-body {
    flex: 1;
    overflow-y: auto;
  }

  .roster-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: none;
    border-bottom: 1px solid var(--color-lightGrey, #d9e0eb);
    background: none;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
    position: relative;
  }

  .roster-item:hover {
    background: var(--bg-secondary-color, #f5f7fb);
  }

  .roster-item.selected {
    background: rgba(47, 99, 240, 0.08);
  }

  .presence {
    font-size: 0.8rem;
    line-height: 1.4rem;
    flex-shrink: 0;
  }

  .info {
    flex: 1;
    min-width: 0;
  }

  .name {
    font-size: 1.03rem;
    font-weight: 600;
    color: var(--font-color, #333333);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .jid {
    font-size: 0.92rem;
    color: var(--color-grey, #60708a);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-text {
    font-size: 0.86rem;
    color: var(--color-grey, #60708a);
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .leave-btn {
    display: none;
    color: var(--color-error, #d43939);
    font-size: 1.26rem;
    cursor: pointer;
    padding: 0 0.2rem;
    line-height: 1;
    user-select: none;
  }

  .roster-item:hover .leave-btn {
    display: block;
  }
</style>
