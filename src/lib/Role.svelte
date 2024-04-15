<script lang="ts">
  import { onMount } from 'svelte'
  import store from '$lib/store'
  import { error } from '$lib/notification'
  import Spinner from './Spinner.svelte'

  let loading = true
  export let pk = 0
  const { detail } = store().role
  const userList = store().user.list

  onMount(async () => {
    loading = true
    const [roleResponse, userResponse] = await Promise.all([
      detail.fetch(pk),
      userList.fetch(),
    ])
    if (!roleResponse.ok) {
      error(roleResponse.statusText)
    }
    if (!userResponse.ok) {
      error(userResponse.statusText)
    }
    loading = false
  })

  const member = (user: any) => {
    const users = $detail.users || $detail.uniqueMembers
    const myusers = users.filter((u: any) => {
      if (user.id) {
        return u.id === user.id
      }
      return u === user.dn
    })
    return myusers.length > 0
  }

  const toggleMembership = (user: any) => async (event: any) => {
    let response
    if (event.target.checked) {
      response = await detail.assign($detail.id || $detail.dn, user.id || user.dn)
    } else {
      response = await detail.deassign($detail.id || $detail.dn, user.id || user.dn)
    }
    if (!response.ok) {
      error(response.statusText)
    } else {
      if ($detail.users) {
        $detail.users = [...$detail.users, user]
      } else {
        $detail.uniqueMembers = [...$detail.uniqueMembers, user.dn]
      }
    }
  }

  async function fetchPrevious() {
    const response = await userList.fetch($userList.page - 1)
    if (!response.ok) {
      error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await userList.fetch($userList.page + 1)
    if (!response.ok) {
      error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>Role: {$detail.name || $detail.cn}</h2>
    <h3>Users</h3>
    <div class="table">
      <div class="heading">ID</div>
      <div class="heading">EMail</div>
      <div class="heading">Active</div>
      <div class="heading">Admin</div>
      <div class="heading">Member</div>
      {#each $userList.data as user}
        <div class="data">{user.id || user.dn}</div>
        <div class="data">{user.email}</div>
        <div class="data">
          <input disabled type="checkbox" checked={user.active || user.userClass == 'enabled'} />
        </div>
        <div class="data">
          <input disabled type="checkbox" checked={user.admin} />
        </div>
        <div class="data">
          <input
            type="checkbox"
            checked={member(user)}
            on:change={toggleMembership(user)}
          />
        </div>
        <div class="border" />
      {/each}
    </div>
  </div>
  <div class="actions">
    <button
      class="button"
      disabled={$userList.page === 1}
      on:click={fetchPrevious}>&lt;</button
    >
    {$userList.page}
    <button
      class="button"
      disabled={$userList.page === $userList.pages}
      on:click={fetchNext}>&gt;</button
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
