<script lang="ts">
  import { setContext, type Snippet } from "svelte";

  let {
    keys,
    children,
  }: {
    keys: symbol | symbol[];
    children?: Snippet;
  } = $props();

  function resetContexts() {
    const keysArr = Array.isArray(keys) ? keys : [keys];
    keysArr.forEach((key) => setContext(key, undefined));
  }

  resetContexts();
</script>

{@render children?.()}
