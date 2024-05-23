<script lang="ts">
  import { QSeparatorDocs } from "$components/separator/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
</script>

<QDocs componentDocs={QSeparatorDocs}>
  {#snippet usage()}
    <div></div>
  {/snippet}
</QDocs>
