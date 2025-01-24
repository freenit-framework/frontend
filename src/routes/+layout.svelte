<script>
  import 'chota'
  import '$lib/store'
  import './app.css'
  import { SvelteToast } from '@zerodevx/svelte-toast'
  import LeftPane from '$lib/LeftPane.svelte'
  import { mdiMenu } from '@mdi/js'

  const options = {}
  let open = $state(false)
  let { children } = $props()

  const toggle = () => {
    open = !open
  }
</script>

<svelte:head>
  <title>Freenit</title>
  <meta name="Freenit" content="Freenit base for Svelte" />
</svelte:head>

<div class="menu">
  <svg class="icon" onclick={toggle} onkeyup={toggle} onkeydown={toggle} role="button" tabindex={0}>
    <path d={mdiMenu} />
  </svg>
  <a href="/" class="title">Freenit</a>
</div>

<SvelteToast {options} />
<LeftPane {open} />
<section class="root">
  <div class="main">
    {@render children?.()}
  </div>
</section>

<style>
  .root {
    height: 100vh;
  }

  .main {
    height: 100%;
    width: 100%;
  }

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
