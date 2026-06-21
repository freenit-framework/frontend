<script lang="ts">
  import CourseGroupMembers from '$lib/CourseGroupMembers.svelte'
  import store from '$lib/store'

  let { data: props } = $props()
</script>

<CourseGroupMembers courseId={props.courseId} groupId={props.groupId} {store} />
