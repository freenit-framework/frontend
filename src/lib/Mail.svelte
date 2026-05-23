<script lang="ts">
  import EmailList from './components/mail/EmailList.svelte'
  import EmailViewer from './components/mail/EmailViewer.svelte'
</script>

<div class="mail-page">
  <div class="email-list-panel">
    <EmailList />
  </div>
  <div class="email-viewer-panel">
    <EmailViewer />
  </div>
</div>

<style>
  .mail-page {
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .email-list-panel {
    width: 340px;
    flex-shrink: 0;
    overflow: hidden;
  }

  .email-viewer-panel {
    flex: 1;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .mail-page {
      flex-direction: column;
    }

    .email-list-panel {
      width: 100%;
      height: 45%;
      flex-shrink: 0;
    }

    .email-viewer-panel {
      flex: 1;
    }
  }
</style>
