<script lang="ts">
  import { untrack } from "svelte";
  import QSideSheet from "$components/side-sheet/QSideSheet.svelte";

  let { query = "" }: { query?: string } = $props();
  const params = new URLSearchParams(untrack(() => query));
  let isOpen = $state(!params.has("closed"));
  let isModal = $state(params.has("modal"));
</script>

<button id="toggle" onclick={() => (isOpen = !isOpen)}>Toggle sheet</button>
<button id="modal" onclick={() => (isModal = !isModal)}>Toggle modal</button>
<div style="display: flex; width: 640px; height: 320px;" dir={params.has("rtl") ? "rtl" : "ltr"}>
  <main style="flex: 1; min-width: 0;">
    <input id="outside" aria-label="Page field" />
  </main>
  <QSideSheet bind:value={isOpen} modal={isModal} headline="Details">
    <input id="inside" aria-label="Sheet field" />
  </QSideSheet>
</div>
