<script lang="ts">
  import { onMount } from 'svelte'
  import { error } from '$lib/notification'
  import Spinner from './Spinner.svelte'

  let { pk = 0, store } = $props()
  let loading = $state(true)

  onMount(async () => {
    loading = true
    const [userResponse, roleResponse] = await Promise.all([store.user.fetch(pk), store.role.fetchAll()])
    if (!userResponse.ok) {
      error(userResponse.statusText)
    }
    if (!roleResponse.ok) {
      error(roleResponse.statusText)
    }
    loading = false
  })

  const member = (role: any) => {
    const myroles = store.user.detail.roles.filter((r: any) => r.id === role.id)
    return myroles.length > 0
  }

  const toggleMembership = (role: any) => async (event: any) => {
    let response
    if (event.target.checked) {
      response = await store.role.assign(role.id || role.dn, store.user.detail.id || store.user.detail.dn)
    } else {
      response = await store.role.deassign(role.id || role.dn, store.user.detail.id || store.user.detail.dn)
    }
    if (!response.ok) {
      error(response.statusText)
    }
  }

  async function fetchPrevious() {
    const response = await store.role.fetchAll(store.role.list.page - 1)
    if (!response.ok) {
      error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.role.fetchAll(store.role.list.page + 1)
    if (!response.ok) {
      error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>User: {store.user.detail.email}</h2>
    <h3>Roles</h3>
    <div class="table">
      <div class="heading">ID</div>
      <div class="heading">Name</div>
      <div class="heading">Member</div>
      {#each store.role.list.data as role}
        <div class="data">{role.id || role.dn}</div>
        <div class="data">{role.name || role.cn}</div>
        <div class="data">
          <input type="checkbox" checked={member(role)} onchange={toggleMembership(role)} />
        </div>
        <div class="border"></div>
      {/each}
    </div>
  </div>
  <div class="actions">
    <button class="button" disabled={store.role.list.page === 1} onclick={fetchPrevious}>&lt;</button>
    {store.role.list.page}
    <button class="button" disabled={store.role.list.page === store.role.list.pages} onclick={fetchNext}
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
    grid-template-columns: repeat(3, auto);
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
    grid-column: 1 / 4;
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

