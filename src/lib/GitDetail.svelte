<script lang="ts">
  import { onMount } from 'svelte'
  import { notification } from '$lib'
  import GitBrowser from './GitBrowser.svelte'
  import Input from './Input.svelte'
  import Spinner from './Spinner.svelte'

  let { pk, store } = $props()
  let loading = $state(true)
  let saving = $state(false)
  let tab = $state<'settings' | 'browser'>('browser')
  let userEmail = $state('')
  let access = $state('read')

  onMount(async () => {
    loading = true
    const [repoResponse, permResponse, logResponse, hooksResponse, projectResponse] =
      await Promise.all([
        store.git.fetch(pk),
        store.git.fetchPermissions(pk),
        store.git.fetchPushLog(pk),
        store.git.fetchHooks(pk),
        store.project.fetchAll(1, 1000),
      ])
    if (!repoResponse.ok) {
      notification.error(repoResponse.statusText)
    }
    if (!permResponse.ok) {
      notification.error(permResponse.statusText)
    }
    if (!logResponse.ok) {
      notification.error(logResponse.statusText)
    }
    if (!hooksResponse.ok) {
      notification.error(hooksResponse.statusText)
    }
    if (!projectResponse.ok) {
      notification.error(projectResponse.statusText)
    }
    loading = false
  })

  async function save(event: Event) {
    event.preventDefault()
    saving = true
    const response = await store.git.edit(pk, {
      project_id: store.git.detail.project_id,
      description: store.git.detail.description || undefined,
      public: store.git.detail.public,
      default_branch: store.git.detail.default_branch,
      tests_enabled: store.git.detail.tests_enabled,
      test_command: store.git.detail.test_command || undefined,
      webhook_url: store.git.detail.webhook_url || undefined,
    })
    saving = false
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }

  async function addPermission(event: Event) {
    event.preventDefault()
    const response = await store.git.addPermission(pk, {
      user_email: userEmail,
      access,
    })
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      userEmail = ''
      access = 'read'
    }
  }

  async function removePermission(permId: number) {
    const response = await store.git.removePermission(pk, permId)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="root">
    <h2>{store.git.detail.name}</h2>

    <div class="tabs">
      <button class="button" class:active={tab === 'browser'} onclick={() => tab = 'browser'}>Browser</button>
      <button class="button" class:active={tab === 'settings'} onclick={() => tab = 'settings'}>Settings</button>
    </div>

    {#if tab === 'browser'}
      <GitBrowser {pk} {store} />
    {/if}

    {#if tab === 'settings'}
    <form onsubmit={save}>
      <label class="select-label" for="project">Project</label>
      <select id="project" bind:value={store.git.detail.project_id} required>
        {#each store.project.list.data as project (project.id)}
          <option value={project.id}>{project.name}</option>
        {/each}
      </select>
      <Input
        bind:value={store.git.detail.path}
        type="text"
        name="path"
        label="Path"
      />
      <Input
        bind:value={store.git.detail.description}
        type="text"
        name="description"
        label="Description"
      />
      <Input
        bind:value={store.git.detail.default_branch}
        type="text"
        name="default_branch"
        label="Default branch"
      />
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={store.git.detail.public} />
        Public
      </label>
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={store.git.detail.tests_enabled} />
        Tests enabled
      </label>
      <Input
        bind:value={store.git.detail.test_command}
        type="text"
        name="test_command"
        label="Test command"
      />
      <Input
        bind:value={store.git.detail.webhook_url}
        type="url"
        name="webhook_url"
        label="Webhook URL"
      />
      <div class="actions">
        <button class="button primary" type="submit" disabled={saving}>Save</button>
      </div>
    </form>

    <h3>Permissions</h3>
    <div class="table permissions">
      <div class="heading">User</div>
      <div class="heading">Access</div>
      <div class="heading">Actions</div>
      {#each store.git.permissions.data as perm (perm.id)}
        <div class="data">{perm.user_email}</div>
        <div class="data">{perm.access}</div>
        <div class="data">
          <button class="button error" onclick={() => removePermission(perm.id)}>Remove</button>
        </div>
        <div class="border"></div>
      {/each}
    </div>

    <form onsubmit={addPermission}>
      <Input bind:value={userEmail} required type="email" name="user_email" label="User email" />
      <label class="select-label" for="access">Access</label>
      <select id="access" bind:value={access}>
        <option value="read">read</option>
        <option value="write">write</option>
        <option value="admin">admin</option>
      </select>
      <div class="actions">
        <button class="button primary" type="submit">Add permission</button>
      </div>
    </form>

    <h3>Push log</h3>
    <div class="table logs">
      <div class="heading">Ref</div>
      <div class="heading">Pusher</div>
      <div class="heading">Status</div>
      {#each store.git.pushLog.data as log (log.id)}
        <div class="data">{log.ref}</div>
        <div class="data">{log.pusher_email}</div>
        <div class="data">{log.status}</div>
        <div class="border"></div>
      {/each}
    </div>

    <h3>Hooks</h3>
    <p>Copy the following scripts into the bare repository's <code>hooks</code> directory.</p>
    {#each Object.entries(store.git.hooks) as [name, script] (name)}
      <div class="hook">
        <strong>{name}</strong>
        <pre>{script}</pre>
      </div>
    {/each}
  {/if}
  </div>
{/if}

<style>
  h3 {
    margin-top: 2rem;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tabs button.active {
    background-color: var(--color-primary);
    color: white;
  }

  .table {
    border: 1px solid var(--color-lightGrey);
    border-radius: 5px;
    padding: 10px;
    display: grid;
  }

  .permissions {
    grid-template-columns: repeat(3, auto);
  }

  .logs {
    grid-template-columns: repeat(3, auto);
  }

  .heading {
    font-weight: bold;
    background-color: var(--bg-secondary-color);
    padding: 5px;
  }

  .data {
    padding: 5px;
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

  .border {
    grid-column: 1 / -1;
    border-top: 1px solid var(--color-lightGrey);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .select-label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 600;
    color: var(--color-grey);
  }

  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-lightGrey);
    border-radius: 4px;
    background: var(--bg-color);
    color: var(--font-color);
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .hook {
    margin-bottom: 1rem;
  }

  pre {
    background: var(--bg-secondary-color);
    padding: 0.5rem;
    overflow-x: auto;
  }
</style>
