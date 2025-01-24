<script lang="ts">
  let { open, toggle } = $props()
</script>

<div class="root" class:open>
  <div class="relative">
    <button class="button close" onclick={toggle}>x</button>
  </div>
  <div class="wrapper">
    <a href="/">Home</a>
    <div class="item">
      Auth
      <a href="/login">Login</a>
      <a href="/register">Register</a>
      <a href="/verify">Verify</a>
      <a href="/logout">Logout</a>
    </div>
    <div class="item">
      Users
      <a href="/profile">Profile</a>
      <a href="/users">List</a>
      <a href="/users/1">Detail</a>
    </div>
    <div class="item">
      Role
      <a href="/roles">List</a>
      <a href="/roles/1">Detail</a>
    </div>
    <div class="item">
      Theme
      <a href="/themes">List</a>
      <a href="/themes/Freenit">Detail</a>
    </div>
  </div>
</div>

<style>
  .root {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100vh;
    max-width: 300px;
    background-color: #eee;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: scroll;
    transition: width 1s;
  }

  .wrapper {
    padding: 20px;
  }

  .open {
    width: 100%;
  }

  .relative {
    position: relative;
  }

  .close {
    position: absolute;
    top: 0;
    right: 0;
  }

  .item {
    color: var(--color-primary);
    cursor: grabbing;
    display: flex;
    flex-direction: column;
  }

  .item a {
    margin-left: 20px;
  }
</style>
