<div class="root">
  <a href="/">Home</a>
  <div class="item">
    Auth
    <a href="/login">Login</a>
    <a href="/register">Register</a>
    <a href="/verify">Verify</a>
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

<style>
  .root {
    width: 300px;
    background-color: #eee;
    display: flex;
    flex-direction: column;
    padding: 20px;
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
