<script lang="ts">
  import { goto } from '$app/navigation'
  import { error } from '$lib/notification'
  import Input from './Input.svelte'

  let email = $state('')
  let password = $state('')
  let { store } = $props()

  const submit = async (event: Event) => {
    event.preventDefault()
    const response = await store.auth.login(email, password)
    if (!response.ok) {
      error(response.statusText)
    } else {
      goto('/')
    }
  }
</script>

<div class="root">
  <form onsubmit={submit} class="form">
    <h2>Login</h2>
    <Input autofocus required type="email" name="email" label="Email" bind:value={email} />
    <Input required type="password" name="password" label="Password" bind:value={password} />
    <div class="actions">
      <button class="button primary">Login</button>
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
    flex-direction: column;
    margin-top: 10px;
  }
</style>
