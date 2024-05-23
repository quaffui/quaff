<script lang="ts">
  import { QToolbarDocs } from "$components/toolbar/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
</script>

<QDocs componentDocs={QToolbarDocs}>
  {#snippet usage()}
    <div></div>
  {/snippet}
</QDocs>
