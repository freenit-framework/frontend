<script lang="ts">
  let { children, open, toggle } = $props()
</script>

<div class="root" class:open>
  <div class="relative">
    <div class="wrapper">
      {@render children?.()}
      <button class="button close" onclick={toggle}>x</button>
    </div>
  </div>
</div>

<style>
  .root {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100vh;
    max-width: 300px;
    background-color: white;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: scroll;
    transition: width 0.5s;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    padding: 20px;
  }

  .open {
    width: 100%;
    border-right-style: solid;
    border-width: 1px;
    border-color: #eee;
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
