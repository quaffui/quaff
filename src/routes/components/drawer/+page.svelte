<script lang="ts">
  import { QDrawerDocs } from "$components/drawer/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
</script>

<QDocs componentDocs={QDrawerDocs}>
  {#snippet usage()}
    <div></div>
  {/snippet}
</QDocs>
