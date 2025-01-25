<script lang="ts">
  let { icon, onclick, href, children } = $props()
</script>

<a class="item" {href}>
  <svg class="icon dark" {onclick} onkeyup={onclick} onkeydown={onclick} role="button" tabindex={0}>
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
