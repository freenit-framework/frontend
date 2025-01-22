<script lang="ts">
  import { onMount } from 'svelte'
  import { error } from '$lib/notification'
  import Spinner from './Spinner.svelte'

  let loading = $state(true)
  let { pk = 0, store } = $props()

  onMount(async () => {
    loading = true
    const [roleResponse, userResponse] = await Promise.all([store.role.fetch(pk), store.user.fetchAll()])
    if (!roleResponse.ok) {
      error(roleResponse.statusText)
    }
    if (!userResponse.ok) {
      error(userResponse.statusText)
    }
    loading = false
  })

  const member = (user: any) => {
    const users = store.role.detail.users || store.role.detail.uniqueMembers
    if (users) {
      const myusers = users.filter((u: any) => {
        if (user.id) {
          return u.id === user.id
        }
        return u === user.dn
      })
      return myusers.length > 0
    }
    return false
  }

  const toggleMembership = (user: any) => async (event: any) => {
    let response
    if (event.target.checked) {
      response = await store.role.assign(store.role.detail.id || store.role.detail.dn, user.id || user.dn)
    } else {
      response = await store.role.deassign(store.role.detail.id || store.role.detail.dn, user.id || user.dn)
    }
    if (!response.ok) {
      error(response.statusText)
    } else {
      if (store.role.detail.users) {
        store.role.detail.users = [...store.role.detail.users, user]
      } else {
        store.role.detail.uniqueMembers = [...store.role.detail.uniqueMembers, user.dn]
      }
    }
  }

  const fetchPrevious = async () => {
    const response = await store.user.fetchAll(store.user.list.page - 1)
    if (!response.ok) {
      error(response.statusText)
    }
  }

  const fetchNext = async () => {
    const response = await store.user.fetchAll(store.user.list.page + 1)
    if (!response.ok) {
      error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>Role: {store.role.detail.name || store.role.detail.cn}</h2>
    <h3>Users</h3>
    <div class="table">
      <div class="heading">ID</div>
      <div class="heading">EMail</div>
      <div class="heading">Active</div>
      <div class="heading">Admin</div>
      <div class="heading">Member</div>
      {#each store.user.list.data as user}
        <div class="data">{user.id || user.dn}</div>
        <div class="data">{user.email}</div>
        <div class="data">
          <input disabled type="checkbox" checked={user.active || user.userClass == 'enabled'} />
        </div>
        <div class="data">
          <input disabled type="checkbox" checked={user.admin} />
        </div>
        <div class="data">
          <input type="checkbox" checked={member(user)} onchange={toggleMembership(user)} />
        </div>
        <div class="border"></div>
      {/each}
    </div>
  </div>
  <div class="actions">
    <button class="button" disabled={store.user.list.page === 1} onclick={fetchPrevious}>&lt;</button>
    {store.user.list.page}
    <button class="button" disabled={store.user.list.page === store.user.list.pages} onclick={fetchNext}
      >&gt;</button
    >
  </div>
{/if}

<style>
  .table {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(5, auto);
  }

  .heading {
    font-weight: bold;
    background-color: #eee;
    padding: 5px;
  }

  .data {
    padding: 5px;
  }

  .border {
    grid-column: 1 / 6;
    border-top: 1px solid #eee;
  }

  .actions {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
  }

  .actions button {
    margin-left: 10px;
    margin-right: 10px;
  }
</style>

