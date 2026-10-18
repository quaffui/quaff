<script lang="ts">
  import { untrack } from "svelte";
  import QDrawer from "#components/drawer/QDrawer.svelte";

  let { query = "" }: { query?: string } = $props();
  const params = new URLSearchParams(untrack(() => query));
  const transitionStyle = params.has("custom") ? "transition: transform 0.4s linear;" : "";
  let isOpen = $state(false);
  let width = $state(240);
  let style = $state(transitionStyle);
</script>

<button
  id="toggle-drawer"
  style="margin-left: 400px;"
  onclick={(event) => {
    isOpen = !isOpen;
    event.stopPropagation();
  }}
>
  Toggle navigation
</button>
<QDrawer
  id="drawer"
  bind:value={isOpen}
  {width}
  {style}
  behavior={params.has("mobile") ? "mobile" : "desktop"}
  noSwipe={!params.has("mobile")}
  aria-label="Navigation"
>
  <button id="resize-drawer" onclick={() => (width = 280)}>Change width</button>
  <button
    id="restyle-drawer"
    onclick={() => (style = `${transitionStyle} background-color: rgb(1, 2, 3);`)}
  >
    Change style
  </button>
</QDrawer>
