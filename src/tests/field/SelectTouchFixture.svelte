<script lang="ts">
  import { untrack } from "svelte";
  import QSelect from "#components/select/QSelect.svelte";

  let { query = "" }: { query?: string } = $props();
  const params = new URLSearchParams(untrack(() => query));
  const disabled = params.has("disabled");
  const nearBottom = params.has("near-bottom");
  const options = nearBottom
    ? ["Home", "Office", ...Array.from({ length: 20 }, (_, index) => `Place ${index + 1}`)]
    : ["Home", "Office"];
  let value = $state("Home");
  let isEditorOpen = $state(true);
  let clickCount = $state(0);
</script>

<main
  style="width: 260px; margin: 48px"
  style:position={nearBottom ? "fixed" : undefined}
  style:bottom={nearBottom ? "0" : undefined}
>
  <button type="button">Outside editor</button>

  {#if isEditorOpen}
    <QSelect
      label="Location"
      {options}
      bind:value
      {disabled}
      onblur={() => (isEditorOpen = false)}
      onclick={() => clickCount++}
    />
  {/if}

  <output id="select-clicks">{clickCount}</output>
</main>
