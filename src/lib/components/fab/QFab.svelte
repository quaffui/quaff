<script lang="ts">
  import QFabBase from "$internal/QFabBase.svelte";
  import type { QFabProps } from "./props";

  let props: QFabProps = $props();
</script>

<QFabBase {...props} />
