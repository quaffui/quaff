<script lang="ts">
  import { QFooterDocs } from "$components/footer/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
</script>

<QDocs componentDocs={QFooterDocs}>
  {#snippet usage()}
    <div></div>
  {/snippet}
</QDocs>
