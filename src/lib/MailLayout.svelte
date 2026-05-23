<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { initMail, mailLoading, mailError, disconnectMailWebSocket } from './mail/store'
  import MailSidebar from './components/mail/MailSidebar.svelte'

  let { children } = $props()

  onMount(async () => { await initMail() })
  onDestroy(() => { disconnectMailWebSocket() })
</script>

<div class="mail-shell">
  {#if $mailLoading && !$mailError}
    <div class="mail-loading">Connecting to mail server…</div>
  {:else if $mailError}
    <div class="mail-error">{$mailError}</div>
  {:else}
    <div class="mail-layout">
      <div class="mail-sidebar">
        <MailSidebar />
      </div>
      <div class="mail-content">
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>

<style>
  .mail-shell {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .mail-loading,
  .mail-error {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
  }

  .mail-loading {
    color: var(--color-grey, #60708a);
  }

  .mail-error {
    color: var(--color-error, #d43939);
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
