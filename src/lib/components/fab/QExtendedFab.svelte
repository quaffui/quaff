<!--
@component
Name the primary action with a label and an optional icon, and collapse when needed.
-->

<script lang="ts">
  import QFabBase from "$internal/QFabBase.svelte";
  import type { QExtendedFabProps } from "./props";

  let props: QExtendedFabProps = $props();
</script>

<QFabBase {...props} />
