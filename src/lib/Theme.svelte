<script lang="ts">
  import { onMount } from 'svelte'
  import store from '$lib/store'
  import { error } from '$lib/notification'
  import Spinner from './Spinner.svelte'

  export let name = ''
  const { detail } = store().theme
  let loading = true

  onMount(async () => {
    loading = true
    const response = await detail.fetch(name)
    if (!response.ok) {
      error(response.statusText)
    }
    loading = false
  })
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>Theme: {name}</h2>
    <div>ID: {$detail.id}</div>
    <div>bg_color: {$detail.bg_color}</div>
    <div>bg_secondary_color: {$detail.bg_secondary_color}</div>
    <div>color_primary: {$detail.color_primary}</div>
    <div>color_lightGrey: {$detail.color_lightGrey}</div>
    <div>color_grey: {$detail.color_grey}</div>
    <div>color_darkGrey: {$detail.color_darkGrey}</div>
    <div>color_error: {$detail.color_error}</div>
    <div>color_success: {$detail.color_success}</div>
    <div>grid_maxWidth: {$detail.grid_maxWidth}</div>
    <div>grid_gutter: {$detail.grid_gutter}</div>
    <div>font_size: {$detail.font_size}</div>
    <div>font_color: {$detail.font_color}</div>
    <div>font_family_sans: {$detail.font_family_sans}</div>
    <div>font_family_mono: {$detail.font_family_mono}</div>
  </div>
{/if}

<style>
</style>
