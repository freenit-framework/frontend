<script lang="ts">
  import { onMount } from 'svelte'
  import Spinner from './Spinner.svelte'
  import { notification } from '$lib'

  const states = [
    { value: 'draft', label: 'Draft' },
    { value: 'published_public', label: 'Public' },
    { value: 'published_private', label: 'Private' },
  ]

  let { courseId, lectureId, store } = $props()
  let loading = $state(true)
  let lectureState = $state('draft')

  onMount(async () => {
    const response = await store.lms.fetchLecture(lectureId)
    if (!response.ok) {
      notification.error(response.statusText)
    } else {
      lectureState = store.lms.lectureDetail.state || 'draft'
    }
    loading = false
  })

  async function saveState() {
    const response = await store.lms.editLecture(lectureId, { state: lectureState })
    if (!response.ok) {
      notification.error(response.statusText)
    }
  }
</script>

{#if loading}
  <Spinner size={200} />
{:else}
  <div class="container">
    <div class="header">
      <div>
        <h2>{store.lms.lectureDetail.title}</h2>
        <span class="state {store.lms.lectureDetail.state}">
          {store.lms.lectureDetail.state?.replace('published_', '') || 'draft'}
        </span>
      </div>
      <a class="button" href={`/courses/${courseId}`}>Back to Course</a>
    </div>
    {#if store.lms.lectureDetail.content}
      <div class="content">{store.lms.lectureDetail.content}</div>
    {/if}
    <div class="state-editor">
      <label for="lecture-state">State</label>
      <select id="lecture-state" bind:value={lectureState}>
        {#each states as s (s.value)}
          <option value={s.value}>{s.label}</option>
        {/each}
      </select>
      <button class="button primary" onclick={saveState}>Save</button>
    </div>
  </div>
{/if}

<style>
  .container {
    padding: 10px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
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

  .content {
    white-space: pre-wrap;
    border: 1px solid var(--color-lightGrey);
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 20px;
  }

  .state-editor {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .state-editor label {
    font-size: 0.875rem;
    color: var(--color-grey);
  }

  .state-editor select {
    padding: 8px;
    border: 1px solid var(--color-lightGrey);
    border-radius: 4px;
    background-color: var(--bg-color);
    color: var(--font-color);
  }
</style>
