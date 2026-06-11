<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { initMail, disconnectMailWebSocket } from './mail/store'
  import MailSidebar from './components/mail/MailSidebar.svelte'

  let { children } = $props()

  onMount(async () => { await initMail() })
  onDestroy(() => { disconnectMailWebSocket() })
</script>

<div class="mail-shell">
  <div class="mail-layout">
    <div class="mail-sidebar">
      <MailSidebar />
    </div>
    <div class="mail-content">
      {@render children?.()}
    </div>
  </div>
</div>

<style>
  .mail-shell {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .mail-layout {
    display: flex;
  }

  .mail-sidebar {
    width: 220px;
    flex-shrink: 0;
  }

  .mail-content {
    flex: 1;
    display: flex;
  }
</style>
