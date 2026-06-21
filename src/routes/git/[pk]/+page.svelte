<script lang="ts">
  import GitDetail from '$lib/GitDetail.svelte'
  import store from '$lib/store'

  let { data }: any = $props()
</script>

<GitDetail pk={Number(data.pk)} store={store} />
