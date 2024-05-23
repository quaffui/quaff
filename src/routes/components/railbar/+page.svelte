<script lang="ts">
  import { QRailbarDocs } from "$components/railbar/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
</script>

<QDocs componentDocs={QRailbarDocs}>
  {#snippet usage()}
    <div></div>
  {/snippet}
</QDocs>
