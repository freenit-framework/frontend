<script lang="ts">
  import { onMount } from 'svelte'
  import { listDirectory, filesLoading, filesError } from '$lib/files/store'

  let { children } = $props()

  onMount(async () => { await listDirectory('/') })
</script>

<svelte:head>
  <title>Files — Freenit</title>
</svelte:head>

<div class="files-shell">
  {#if $filesLoading && !$filesError && false}
    <!-- layout-level loader intentionally suppressed; page handles its own loading states -->
  {/if}
  {@render children?.()}
</div>

<style>
  .files-shell {
    height: 100%;
    display: flex;
    overflow: hidden;
  }
</style>
