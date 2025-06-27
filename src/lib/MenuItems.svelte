<script lang="ts">
  import {
    mdiAccount,
    mdiAccountGroup,
    mdiArrowDownBoldCircleOutline,
    mdiCookieEditOutline,
    mdiFaceManProfile,
    mdiLoginVariant,
    mdiLogoutVariant,
    mdiSitemap,
  } from '@mdi/js'
  import MenuItem from '$lib/MenuItem.svelte'
  import { dbtype } from './utils.js'

  let { toggle, logout, store } = $props()
</script>

{#if store.auth.loggedin()}
  {#if store.user.profile.admin}
    <MenuItem href="/users" {toggle} icon={mdiAccount}>Users</MenuItem>
    <MenuItem href="/roles" {toggle} icon={mdiAccountGroup}>Roles</MenuItem>
    <MenuItem href="/themes" {toggle} icon={mdiCookieEditOutline}>Themes</MenuItem>
    {#if dbtype(store.user.profile) === "ldap"}
      <MenuItem href="/domains" {toggle} icon={mdiSitemap}>Domains</MenuItem>
    {/if}
  {/if}
  <MenuItem href="/profile" {toggle} icon={mdiFaceManProfile}>Profile</MenuItem>
  <MenuItem href="/" toggle={logout} icon={mdiLogoutVariant}>Logout</MenuItem>
{:else}
  <MenuItem href="/register" {toggle} icon={mdiArrowDownBoldCircleOutline}>Register</MenuItem>
  <MenuItem href="/login" {toggle} icon={mdiLoginVariant}>Login</MenuItem>
{/if}
