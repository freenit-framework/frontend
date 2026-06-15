<script lang="ts">
  import { onMount } from 'svelte'
  import {
    initMail,
    disconnectMailWebSocket,
    deleteEmail,
    selectedEmailId,
  } from './mail/store'
  import MailSidebar from './components/mail/MailSidebar.svelte'
  import EmailList from './components/mail/EmailList.svelte'
  import EmailViewer from './components/mail/EmailViewer.svelte'

  function handleKeydown(event: KeyboardEvent) {
    if (
      event.key !== 'Delete' ||
      event.repeat ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey
    ) {
      return
    }

    const target = event.target
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLElement && target.isContentEditable)
    ) {
      return
    }

    if ($selectedEmailId) {
      event.preventDefault()
      void deleteEmail($selectedEmailId)
    }
  }

  onMount(() => {
    void initMail()
    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('keydown', handleKeydown)
      disconnectMailWebSocket()
    }
  })
</script>

<div class="mail-shell">
  <div class="mail-layout">
    <div class="mail-sidebar">
      <MailSidebar />
    </div>
    <div class="mail-list">
      <EmailList />
    </div>
    <div class="mail-viewer">
      <EmailViewer />
    </div>
  </div>
</div>

<style>
  .mail-shell {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .mail-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .mail-sidebar {
    width: 220px;
    flex-shrink: 0;
    height: 100%;
    overflow: hidden;
  }

  .mail-list {
    width: 340px;
    flex-shrink: 0;
    height: 100%;
    overflow: hidden;
  }

  .mail-viewer {
    flex: 1;
    height: 100%;
    overflow: hidden;
    min-width: 0;
  }
</style>
