<script lang="ts">
  import { untrack } from "svelte";
  import { initMeta, QMetaHead, type MetaSource } from "../../lib/meta.js";
  import MetaPage from "./MetaPage.svelte";

  let {
    defaults,
    pages = [],
  }: {
    defaults?: MetaSource;
    pages?: MetaSource[];
  } = $props();

  initMeta(untrack(() => defaults));
</script>

{#each pages as metadata (metadata)}
  <MetaPage {metadata} />
{/each}

<QMetaHead />
