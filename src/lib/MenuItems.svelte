<script lang="ts">
  import {
    mdiAccount,
    mdiAccountGroup,
    mdiArrowDownBoldCircleOutline,
    mdiCookieEditOutline,
    mdiFaceManProfile,
    mdiLoginVariant,
    mdiLogoutVariant,
    mdiStamper,
  } from '@mdi/js'
  import store from '$lib/store'
  import MenuItem from '$lib/MenuItem.svelte'

  let { toggle, logout } = $props()
</script>

{#if store.auth.loggedin()}
  {#if store.user.profile.admin}
    <MenuItem href="/users" {toggle} icon={mdiAccount}>Users</MenuItem>
    <MenuItem href="/roles" {toggle} icon={mdiAccountGroup}>Roles</MenuItem>
    <MenuItem href="/themes" {toggle} icon={mdiCookieEditOutline}>Themes</MenuItem>
  {/if}
  <MenuItem href="/profile" {toggle} icon={mdiFaceManProfile}>Profile</MenuItem>
  <MenuItem href="/logout" toggle={logout} icon={mdiLogoutVariant}>Logout</MenuItem>
{:else}
  <MenuItem href="/register" {toggle} icon={mdiArrowDownBoldCircleOutline}>Register</MenuItem>
  <MenuItem href="/verify" {toggle} icon={mdiStamper}>Verify</MenuItem>
  <MenuItem href="/login" {toggle} icon={mdiLoginVariant}>Login</MenuItem>
{/if}
