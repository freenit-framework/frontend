<script lang="ts">
  import KanbanBoard from '$lib/KanbanBoard.svelte'
  import store from '$lib/store'

  let { data: props } = $props()
</script>

<KanbanBoard projectId={props.projectId} boardId={props.boardId} taskId={props.taskId} store={store} />
