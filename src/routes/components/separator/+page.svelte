<script lang="ts">
  import { QSeparatorVerticalDocs, QSeparatorHorizontalDocs } from "$components/separator/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
</script>

<QDocs componentDocs={[QSeparatorHorizontalDocs, QSeparatorVerticalDocs]}>
  {#snippet usage()}
    <div></div>
  {/snippet}
</QDocs>
