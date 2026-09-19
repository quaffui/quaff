<script lang="ts">
  import QFabBase from "$internal/QFabBase.svelte";
  import type { QExtendedFabProps } from "./props";

  let props: QExtendedFabProps = $props();
</script>

<QFabBase {...props} />
