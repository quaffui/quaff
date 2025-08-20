<script lang="ts">
  import { setContext, type Snippet } from "svelte";

  let {
    keys,
    children,
  }: {
    keys: symbol | symbol[];
    children?: Snippet;
  } = $props();

  const keysArr = Array.isArray(keys) ? keys : [keys];
  keysArr.forEach((key) => setContext(key, undefined));
</script>

{@render children?.()}
