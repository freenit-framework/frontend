<script lang="ts">
  import {
    mdiAccount,
    mdiAccountGroup,
    mdiArrowDownBoldCircleOutline,
    mdiFaceManProfile,
    mdiLoginVariant,
    mdiLogoutVariant,
    mdiSitemap,
    mdiEmailOutline,
    mdiCalendarBlank,
    mdiContactsOutline,
    mdiFolder,
    mdiFilterOutline,
    mdiChatOutline,
    mdiEmailNewsletter,
    mdiSchool,
    mdiSourceBranch,
  } from '@mdi/js'
  import MenuItem from '$lib/MenuItem.svelte'
  import { dbtype } from './utils.js'

  let { toggle, logout, store } = $props()

  const has = (name: string) => store.modulesLoaded && store.modules.includes(name)
</script>

{#if store.auth.loggedin()}
  {#if store.user.profile.admin}
    {#if has('user')}
      <MenuItem href="/users" {toggle} icon={mdiAccount}>Users</MenuItem>
    {/if}
    {#if has('role')}
      <MenuItem href="/roles" {toggle} icon={mdiAccountGroup}>Roles</MenuItem>
    {/if}
    {#if has('mailinglist')}
      <MenuItem href="/mailinglists" {toggle} icon={mdiEmailNewsletter}>Mailing Lists</MenuItem>
    {/if}
    {#if has('git')}
      <MenuItem href="/git" {toggle} icon={mdiSourceBranch}>Git</MenuItem>
    {/if}
    {#if has('domain') && dbtype(store.user.profile) === "ldap"}
      <MenuItem href="/domains" {toggle} icon={mdiSitemap}>Domains</MenuItem>
    {/if}
  {/if}
  {#if has('project')}
    <MenuItem href="/projects" {toggle} icon={mdiSitemap}>Projects</MenuItem>
  {/if}
  {#if has('lms')}
    <MenuItem href="/courses" {toggle} icon={mdiSchool}>Courses</MenuItem>
  {/if}
  {#if has('user')}
    <MenuItem href="/profile" {toggle} icon={mdiFaceManProfile}>Profile</MenuItem>
  {/if}
  {#if has('mail')}
    <MenuItem href="/mail" {toggle} icon={mdiEmailOutline}>Mail</MenuItem>
  {/if}
  {#if has('dav')}
    <MenuItem href="/calendar" {toggle} icon={mdiCalendarBlank}>Calendar</MenuItem>
    <MenuItem href="/contacts" {toggle} icon={mdiContactsOutline}>Contacts</MenuItem>
    <MenuItem href="/files" {toggle} icon={mdiFolder}>Files</MenuItem>
  {/if}
  {#if has('sieve')}
    <MenuItem href="/sieve" {toggle} icon={mdiFilterOutline}>Filters</MenuItem>
  {/if}
  {#if has('jabber')}
    <MenuItem href="/jabber" {toggle} icon={mdiChatOutline}>Jabber</MenuItem>
  {/if}
  <MenuItem href="/" toggle={logout} icon={mdiLogoutVariant}>Logout</MenuItem>
{:else}
  {#if has('mailinglist')}
    <MenuItem href="/mailinglists/public" {toggle} icon={mdiEmailNewsletter}>Mailing Lists</MenuItem>
  {/if}
  <MenuItem href="/register" {toggle} icon={mdiArrowDownBoldCircleOutline}>Register</MenuItem>
  <MenuItem href="/login" {toggle} icon={mdiLoginVariant}>Login</MenuItem>
{/if}
