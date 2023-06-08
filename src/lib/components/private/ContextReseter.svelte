<script lang="ts">
  import { setContext } from "svelte";

  export let keys: string | string[];

  $: if (Array.isArray(keys)) {
    for (let key of keys) {
      setContext(key, undefined);
    }
  } else {
    setContext(keys, undefined);
  }
</script>

<slot />
