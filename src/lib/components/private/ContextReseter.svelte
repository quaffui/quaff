<script lang="ts">
  import { QContext } from "$lib/classes/QContext.svelte";
  import type { Snippet } from "svelte";

  let {
    keys,
    children,
  }: {
    keys: symbol | symbol[];
    children?: Snippet;
  } = $props();

  const keysArr = Array.isArray(keys) ? keys : [keys];
  keysArr.forEach((key) => QContext.reset(key));
</script>

{@render children?.()}
