<script lang="ts">
  import { goto } from '$app/navigation'
  import { error } from '$lib/notification'

  let email = $state('')
  let password = $state('')
  let repeatpassword = $state('')
  let { store } = $props()

  const submit = async (event: Event) => {
    event.preventDefault()
    const response = await store.auth.register(email, password)
    if (!response.ok) {
      error(response.statusText)
    } else {
      goto('/verify')
    }
  }
</script>

<div class="root">
  <form onsubmit={submit} class="form">
    <label for="email">Email</label>
    <!-- svelte-ignore a11y_autofocus -->
    <input autofocus required type="email" name="email" bind:value={email} />

    <label for="password">Password</label>
    <input required type="password" name="password" bind:value={password} />

    <label for="password">Repeat Password</label>
    <input required type="password" name="repeatpassword" bind:value={repeatpassword} />

    <div class="actions">
      <button class="button">Register</button>
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

