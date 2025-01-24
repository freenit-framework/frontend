<script>
  import 'chota'
  import './app.css'
  import { onMount } from 'svelte'
  import { SvelteToast } from '@zerodevx/svelte-toast'
  import store from '$lib/store'
  import LeftPane from '$lib/LeftPane.svelte'
  import MenuBar from '$lib/MenuBar.svelte'

  const options = {}
  let open = $state(false)
  let { children } = $props()

  const toggle = () => {
    open = !open
  }

  onMount(async () => { await store.auth.refresh_token() })
</script>

<svelte:head>
  <title>Freenit</title>
  <meta name="Freenit" content="Freenit base for Svelte" />
</svelte:head>

<SvelteToast {options} />
<MenuBar {toggle} title="Freenit" />
<LeftPane {open} {toggle} />
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
</style>
