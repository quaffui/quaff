<script lang="ts">
  import QContext from "$lib/classes/QContext.svelte";
  import type { Snippet } from "svelte";

  let {
    keys,
    children,
  }: {
    keys: string | string[];
    children?: Snippet;
  } = $props();

  $effect(() => {
    const keysArr = Array.isArray(keys) ? keys : [keys];
    keysArr.forEach((key) => QContext.reset(key));
  });
</script>

{#if children}
  {@render children()}
{/if}
