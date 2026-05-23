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
    mdiEmailOutline,
    mdiCalendarBlank,
    mdiContactsOutline,
    mdiFolder,
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
  <MenuItem href="/mail" {toggle} icon={mdiEmailOutline}>Mail</MenuItem>
  <MenuItem href="/calendar" {toggle} icon={mdiCalendarBlank}>Calendar</MenuItem>
  <MenuItem href="/contacts" {toggle} icon={mdiContactsOutline}>Contacts</MenuItem>
  <MenuItem href="/files" {toggle} icon={mdiFolder}>Files</MenuItem>
  <MenuItem href="/" toggle={logout} icon={mdiLogoutVariant}>Logout</MenuItem>
{:else}
  <MenuItem href="/register" {toggle} icon={mdiArrowDownBoldCircleOutline}>Register</MenuItem>
  <MenuItem href="/login" {toggle} icon={mdiLoginVariant}>Login</MenuItem>
{/if}
