<script lang="ts">
  import { onMount } from 'svelte'
  import { store } from '$lib'
  import { error } from '$lib/notification'
  import Spinner from './Spinner.svelte'

  export let name = ''
  let loading = true

  onMount(async () => {
    loading = true
    const response = await store.theme.detail.fetch(name)
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
    <div>ID: {store.theme.detail.id}</div>
    <div>bg_color: {store.theme.detail.bg_color}</div>
    <div>bg_secondary_color: {store.theme.detail.bg_secondary_color}</div>
    <div>color_primary: {store.theme.detail.color_primary}</div>
    <div>color_lightGrey: {store.theme.detail.color_lightGrey}</div>
    <div>color_grey: {store.theme.detail.color_grey}</div>
    <div>color_darkGrey: {store.theme.detail.color_darkGrey}</div>
    <div>color_error: {store.theme.detail.color_error}</div>
    <div>color_success: {store.theme.detail.color_success}</div>
    <div>grid_maxWidth: {store.theme.detail.grid_maxWidth}</div>
    <div>grid_gutter: {store.theme.detail.grid_gutter}</div>
    <div>font_size: {store.theme.detail.font_size}</div>
    <div>font_color: {store.theme.detail.font_color}</div>
    <div>font_family_sans: {store.theme.detail.font_family_sans}</div>
    <div>font_family_mono: {store.theme.detail.font_family_mono}</div>
  </div>
{/if}

<style>
</style>
