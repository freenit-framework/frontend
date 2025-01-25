<script lang="ts">
  let { icon, toggle, href, children } = $props()
</script>

<a
  class="item"
  {href}
  onclick={toggle}
  onkeyup={toggle}
  onkeydown={toggle}
  role="button"
  tabindex={0}
>
  <svg class="icon dark">
    <path d={icon} />
  </svg>
  {@render children?.()}
</a>

<style>
  .item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-align: center;
  }

  .icon {
    width: 26px;
    height: 26px;
    fill: white;
  }

  .dark {
    fill: black;
  }
</style>
