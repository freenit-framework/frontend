<script lang="ts">
  import Lecture from '$lib/Lecture.svelte'
  import store from '$lib/store'

  let { data: props } = $props()
</script>

<Lecture courseId={props.courseId} lectureId={props.lectureId} {store} />
