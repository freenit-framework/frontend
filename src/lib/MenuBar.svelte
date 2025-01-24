<script lang="ts">
  import { mdiMenu } from '@mdi/js'

  let { title, toggle } = $props()
</script>

<div class="menu">
  <svg class="icon" onclick={toggle} onkeyup={toggle} onkeydown={toggle} role="button" tabindex={0}>
    <path d={mdiMenu} />
  </svg>
  <a href="/" class="title">{title}</a>
</div>

<style>
  .menu {
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    background-color: var(--color-primary);
    color: white;
  }

  .icon {
    width: 26px;
    height: 26px;
    fill: white;
  }

  .title {
    padding: 0;
    margin: 0;
    color: white;
    font-size: 3rem;
  }
</style>
