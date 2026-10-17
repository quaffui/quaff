<script lang="ts">
  import { untrack } from "svelte";
  import QLayout from "#components/layout/QLayout.svelte";
  import QRailbar from "#components/railbar/QRailbar.svelte";

  let { query = "" }: { query?: string } = $props();
  const params = new URLSearchParams(untrack(() => query));
  const width = params.get("width") ?? "200";
  let isConstrained = $state(false);
</script>

<button id="constrain" onclick={() => (isConstrained = true)}>Constrain rail</button>
<div id="frame" style:width="{width}px" style="height: 400px;">
  <QLayout view="lhh lpr lff">
    {#snippet railbarStart()}
      <QRailbar
        id="rail"
        expanded
        style={isConstrained ? "max-width: 128px;" : undefined}
        aria-label="Navigation"
      >
        <button>Destination</button>
      </QRailbar>
    {/snippet}
    <p>Content</p>
  </QLayout>
</div>
