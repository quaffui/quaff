<script lang="ts">
  import { QListDocs } from "$components/list/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
</script>

<QDocs componentDocs={QListDocs}>
  <div slot="usage"></div>
</QDocs>
