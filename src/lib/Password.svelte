<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { Input, notification, utils } from '$lib'

  let { store } = $props()
  let password = $state('')
  let repeat_password = $state('')

  onMount(async () => {
    store.user.fetchProfile()
  })

  const submit = async (event: Event) => {
    event.preventDefault()
    if (password !== repeat_password) {
      notification.error('Passwords do not match')
      return
    }
    const response = await store.user.editProfile({ password })
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      notification.success("Password changed")
    }
    goto("/profile")
  }
</script>

<div class="root">
  <form onsubmit={submit} class="form">
    <h2>Change Password</h2>
    <Input
      autofocus
      required
      type="password"
      name="password"
      label="Password"
      bind:value={password}
    />
    <Input
      required
      type="password"
      name="repeat password"
      label="Repeat Password"
      bind:value={repeat_password}
    />
    <div class="actions">
      <button class="button primary">Submit</button>
      <a href="/profile" class="button secondary">Cancel</a>
    </div>
  </form>
</div>

<style>
  .root {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .form {
    border: 1px solid;
    padding: 20px;
    border-radius: 5px;
    border-color: #aaa;
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
  }
</style>
