<script lang="ts">
  import { onMount } from 'svelte'
  import Modal from '$lib/Modal.svelte'
  import Input from './Input.svelte'
  import Spinner from './Spinner.svelte'
  import { notification } from '$lib'

  let { courseId, store } = $props()
  let loading = $state(true)
  const states = [
    { value: 'draft', label: 'Draft' },
    { value: 'published_public', label: 'Public' },
    { value: 'published_private', label: 'Private' },
  ]

  let showCreate = $state(false)
  let title = $state('')
  let content = $state('')
  let position = $state('')
  let lectureState = $state('draft')

  onMount(async () => {
    const response = await store.lms.fetchLectures(courseId)
    if (!response.ok) {
      notification.error(response.statusText)
    }
    loading = false
  })

  function toggleShowCreate(event: Event) {
    event.preventDefault()
    showCreate = !showCreate
    if (!showCreate) {
      resetForm()
    }
  }

  function resetForm() {
    title = ''
    content = ''
    position = ''
    lectureState = 'draft'
  }

  async function create(event: Event) {
    event.preventDefault()
    const fields: Record<string, any> = {
      title,
      content: content || undefined,
      state: lectureState,
    }
    const pos = parseInt(position, 10)
    if (!isNaN(pos)) {
      fields.position = pos
    }
    const response = await store.lms.createLecture(courseId, fields)
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      resetForm()
      showCreate = false
    }
  }

  async function destroy(id: number) {
    const response = await store.lms.destroyLecture(id)
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="lectures">
    <div class="header">
      <h3>Lectures</h3>
      <button class="button primary" onclick={toggleShowCreate}>Add Lecture</button>
    </div>
    {#if store.lms.lectures.length === 0}
      <p>No lectures yet.</p>
    {:else}
      <div class="lecture-list">
        {#each store.lms.lectures as lecture (lecture.id)}
          <div class="lecture-item">
            <div class="lecture-info">
              <a class="lecture-title" href={`/courses/${courseId}/lectures/${lecture.id}`}>
                {lecture.title}
              </a>
              <span class="state {lecture.state}">{lecture.state.replace('published_', '')}</span>
              {#if lecture.position !== undefined}
                <span class="position">#{lecture.position}</span>
              {/if}
            </div>
            <button class="button error" onclick={() => destroy(lecture.id)}>Delete</button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<Modal open={showCreate}>
  <h2>Add Lecture</h2>
  <form onsubmit={create}>
    <Input bind:value={title} autofocus required type="text" name="title" label="Title" />
    <Input bind:value={content} type="text" name="content" label="Content" />
    <Input bind:value={position} type="number" name="position" label="Position" />
    <div class="select-row">
      <label for="lecture-state">State</label>
      <select id="lecture-state" bind:value={lectureState}>
        {#each states as s (s.value)}
          <option value={s.value}>{s.label}</option>
        {/each}
      </select>
    </div>
    <div class="actions">
      <button class="button primary" type="submit">Add</button>
      <button class="button error" onclick={toggleShowCreate} type="button">Close</button>
    </div>
  </form>
</Modal>

<style>
  .lectures {
    margin-top: 20px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .lecture-list {
    border: 1px solid var(--color-lightGrey);
    border-radius: 5px;
    padding: 10px;
  }

  .lecture-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--color-lightGrey);
  }

  .lecture-item:last-child {
    border-bottom: none;
  }

  .lecture-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .lecture-title {
    font-weight: bold;
  }

  .position {
    font-size: 0.75rem;
    color: var(--color-grey);
  }

  .state {
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .state.draft {
    background-color: var(--color-lightGrey);
  }

  .state.published_public {
    background-color: var(--color-success);
    color: var(--bg-color);
  }

  .state.published_private {
    background-color: var(--color-warning);
    color: var(--bg-color);
  }

  .select-row {
    display: flex;
    flex-direction: column;
    margin-top: 15px;
  }

  .select-row label {
    font-size: 0.875rem;
    color: var(--color-grey);
    margin-bottom: 4px;
  }

  .select-row select {
    padding: 8px;
    border: 1px solid var(--color-lightGrey);
    border-radius: 4px;
    background-color: var(--bg-color);
    color: var(--font-color);
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
