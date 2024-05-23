<script lang="ts">
  import { QTooltipDocs } from "$components/tooltip/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
</script>

<QDocs componentDocs={QTooltipDocs}>
  {#snippet usage()}
    <div></div>
  {/snippet}
</QDocs>
