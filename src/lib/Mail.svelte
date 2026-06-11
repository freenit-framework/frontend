<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { initMail, disconnectMailWebSocket } from './mail/store'
  import MailSidebar from './components/mail/MailSidebar.svelte'
  import EmailList from './components/mail/EmailList.svelte'
  import EmailViewer from './components/mail/EmailViewer.svelte'

  onMount(async () => { await initMail() })
  onDestroy(() => { disconnectMailWebSocket() })
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
  }

  .mail-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .mail-sidebar {
    width: 220px;
    flex-shrink: 0;
  }

  .mail-list {
    width: 340px;
    flex-shrink: 0;
    overflow: hidden;
  }

  .mail-viewer {
    flex: 1;
    overflow: hidden;
  }
</style>
