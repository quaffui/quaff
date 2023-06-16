<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import { QBtnDocs } from "$lib/components/button/docs";
  import ApiDoc from "$lib/components/private/ApiDoc.svelte";
</script>

<ApiDoc QComponentDocs={QBtnDocs}>
  <QBtn slot="display" icon="star">Star me on Github</QBtn>
</ApiDoc>
