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

  .mail-content {
    flex: 1;
    display: flex;
    height: 100%;
    overflow: hidden;
    min-width: 0;
  }
</style>
