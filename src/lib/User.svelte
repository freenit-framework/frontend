<script lang="ts">
  import { onMount } from 'svelte'
  import { notification, utils } from '$lib'
  import Spinner from './Spinner.svelte'

  let { pk = 0, store } = $props()
  let loading = $state(true)

  onMount(async () => {
    loading = true
    const [userResponse, roleResponse] = await Promise.all([
      store.user.fetch(pk),
      store.role.fetchAll(),
    ])
    if (!userResponse.ok) {
      notification.error(userResponse.statusText)
    }
    if (!roleResponse.ok) {
      notification.error(roleResponse.statusText)
    }
    loading = false
  })

  const member = (role: any) => {
    const roles = store.user.detail.roles ?? []
    const myroles = roles.filter((r: any) => r.id === role.id)
    return myroles.length > 0
  }

  const toggleMembership = (role: any) => async (event: any) => {
    let response
    if (event.target.checked) {
      response = await store.role.assign(utils.name(role), utils.uid(store.user.detail))
    } else {
      response = await store.role.deassign(utils.name(role), utils.uid(store.user.detail))
    }
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function fetchPrevious() {
    const response = await store.role.fetchAll(store.role.list.page - 1)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await store.role.fetchAll(store.role.list.page + 1)
    if (!response.ok) {
      notification.error(response.statusText)
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
        <div class="data">{utils.id(role)}</div>
        <a class="data" href={`/roles/${utils.name(role)}`}>{utils.name(role)}</a>
        <div class="data">
          <input type="checkbox" checked={member(role)} onchange={toggleMembership(role)} />
        </div>
        <div class="border"></div>
      {/each}
    </div>
  </div>
  <div class="actions">
    <button class="button" disabled={store.role.list.page === 1} onclick={fetchPrevious}
      >&lt;</button
    >
    {store.role.list.page}
    <button
      class="button"
      disabled={store.role.list.total === 0 || store.role.list.page === store.role.list.pages}
      onclick={fetchNext}>&gt;</button
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
