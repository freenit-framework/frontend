<script lang="ts">
  import ContactList from './components/contacts/ContactList.svelte'
  import ContactViewer from './components/contacts/ContactViewer.svelte'
  import ContactEditor from './components/contacts/ContactEditor.svelte'
  import { selectedContact, selectContact } from './contacts/store'

  type Panel = 'view' | 'edit' | 'new'

  let panel = $state<Panel>('view')

  function handleNew() {
    selectContact(null)
    panel = 'new'
  }

  function handleEdit() {
    panel = 'edit'
  }

  function handleCancel() {
    panel = 'view'
  }

  // When selection changes, switch back to view mode
  $effect(() => {
    if ($selectedContact) panel = 'view'
  })
</script>

<div class="contacts-layout">
  <div class="list-pane">
    <ContactList onNew={handleNew} />
  </div>

  <div class="detail-pane">
    {#if panel === 'new'}
      <ContactEditor onCancel={handleCancel} />
    {:else if panel === 'edit' && $selectedContact}
      <ContactEditor contact={$selectedContact} onCancel={handleCancel} />
    {:else if $selectedContact}
      <ContactViewer contact={$selectedContact} onEdit={handleEdit} />
    {:else}
      <div class="empty-state">Select a contact or create a new one.</div>
    {/if}
  </div>
</div>

<style>
  .contacts-layout {
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .list-pane {
    width: 280px;
    flex-shrink: 0;
    overflow: hidden;
  }

  .detail-pane {
    flex: 1;
    overflow: hidden;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-grey, #60708a);
    font-size: 0.95rem;
  }

  @media (max-width: 640px) {
    .contacts-layout {
      flex-direction: column;
    }

    .list-pane {
      width: 100%;
      height: 50%;
    }
  }
</style>
