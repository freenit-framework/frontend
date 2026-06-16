<script lang="ts">
  import MailingListArchivePublic from '$lib/MailingListArchivePublic.svelte'
  import store from '$lib/store'

  let { data }: any = $props()
</script>

<MailingListArchivePublic pk={Number(data.pk)} store={store} />
