<script lang="ts">
  import MailingListDetail from '$lib/MailingListDetail.svelte'
  import store from '$lib/store'

  let { data }: any = $props()
</script>

<MailingListDetail pk={Number(data.pk)} store={store} />
