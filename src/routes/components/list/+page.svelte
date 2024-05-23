<script lang="ts">
  import { QListDocs } from "$components/list/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
</script>

<QDocs componentDocs={QListDocs}>
  {#snippet usage()}
    <div></div>
  {/snippet}
</QDocs>
