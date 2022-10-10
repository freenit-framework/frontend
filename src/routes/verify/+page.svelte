<script lang="ts">
  import { goto } from '$app/navigation'

  let token = ''
  function submit() {
    goto(`/verify/${token}`)
  }
</script>

<div class="container">
  <h2>Verify Account</h2>
  <form on:submit|preventDefault={submit}>
    <!-- svelte-ignore a11y-autofocus -->
    <input autofocus bind:value={token} />
    <div class="actions">
      <button class="button" type="submit">OK</button>
    </div>
  </form>
</div>

<style>
  .actions {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
