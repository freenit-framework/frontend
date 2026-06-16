<script lang="ts">
  let { children, open } = $props()
</script>

{#if open}
  <div class="modal_background">
    <div class="modal">
      {@render children?.()}
    </div>
  </div>
{/if}

<style>
  .modal_background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-color);
    color: var(--font-color);
    filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.5));
    border-radius: 5px;
    padding: 10px;
  }
</style>
