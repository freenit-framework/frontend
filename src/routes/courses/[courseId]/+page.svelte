<script lang="ts">
  import Course from '$lib/Course.svelte'
  import store from '$lib/store'

  let { data: props } = $props()
</script>

<Course courseId={props.courseId} {store} />
