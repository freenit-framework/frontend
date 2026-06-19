<script lang="ts">
  let { children, open, toggle } = $props()
</script>

<div class="root" class:open>
  <div class="relative">
    <div class="wrapper">
      <button class="button close" onclick={toggle}>x</button>
      {@render children?.()}
    </div>
  </div>
</div>

<style>
  .root {
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 100vh;
    max-width: 400px;
    background-color: var(--bg-color);
    color: var(--font-color);
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: scroll;
    transition: width 0.5s;
    z-index: 999;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    padding: 20px;
    min-width: 360px;
  }

  .open {
    width: 100%;
    border-left-style: solid;
    border-width: 1px;
    border-color: var(--color-lightGrey);
  }

  .relative {
    position: relative;
  }

  .close {
    position: absolute;
    top: 0;
    right: 0;
  }
</style>
