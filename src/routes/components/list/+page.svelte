<script lang="ts">
  import { QListDocs, QItemDocs, QItemSectionDocs } from "$components/list/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
</script>

<QDocs componentDocs={[QListDocs, QItemDocs, QItemSectionDocs]}>
  {#snippet usage()}
    <div></div>
  {/snippet}
</QDocs>
