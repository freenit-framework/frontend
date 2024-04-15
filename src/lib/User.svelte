<script lang="ts">
  import { onMount } from 'svelte'
  import store from '$lib/store'
  import { error } from '$lib/notification'
  import Spinner from './Spinner.svelte'

  export let pk = 0
  let loading = true
  const { detail } = store().user
  const roleList = store().role.list
  const roleDetail = store().role.detail

  onMount(async () => {
    loading = true
    const [userResponse, roleResponse] = await Promise.all([
      detail.fetch(pk),
      roleList.fetch(),
    ])
    if (!userResponse.ok) {
      error(userResponse.statusText)
    }
    if (!roleResponse.ok) {
      error(roleResponse.statusText)
    }
    loading = false
  })

  const member = (role: any) => {
    const myroles = $detail.roles.filter((r: any) => r.id === role.id)
    return myroles.length > 0
  }

  const toggleMembership = (role: any) => async (event: any) => {
    let response
    if (event.target.checked) {
      response = await roleDetail.assign(role.id || role.dn, $detail.id || $detail.dn)
    } else {
      response = await roleDetail.deassign(role.id || role.dn, $detail.id || $detail.dn)
    }
    if (!response.ok) {
      error(response.statusText)
    } else {
      $detail.roles = [...$detail.roles, role]
    }
  }

  async function fetchPrevious() {
    const response = await roleList.fetch($roleList.page - 1)
    if (!response.ok) {
      error(response.statusText)
    }
  }

  async function fetchNext() {
    const response = await roleList.fetch($roleList.page + 1)
    if (!response.ok) {
      error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <h2>User: {$detail.email}</h2>
    <h3>Roles</h3>
    <div class="table">
      <div class="heading">ID</div>
      <div class="heading">Name</div>
      <div class="heading">Member</div>
      {#each $roleList.data as role}
        <div class="data">{role.id || role.dn}</div>
        <div class="data">{role.name || role.cn}</div>
        <div class="data">
          <input
            type="checkbox"
            checked={member(role)}
            on:change={toggleMembership(role)}
          />
        </div>
        <div class="border" />
      {/each}
    </div>
  </div>
  <div class="actions">
    <button
      class="button"
      disabled={$roleList.page === 1}
      on:click={fetchPrevious}>&lt;</button
    >
    {$roleList.page}
    <button
      class="button"
      disabled={$roleList.page === $roleList.pages}
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
