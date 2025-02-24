<script lang="ts">
  import { QSeparatorVerticalDocs, QSeparatorHorizontalDocs } from "$components/separator/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
</script>

<QDocs componentDocs={[QSeparatorVerticalDocs, QSeparatorHorizontalDocs]}>
  {#snippet usage()}
    <div></div>
  {/snippet}
</QDocs>
