<script lang="ts">
  import { QDrawerDocs } from "$components/drawer/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
</script>

<QDocs componentDocs={QDrawerDocs}>
  <div slot="usage"></div>
</QDocs>
