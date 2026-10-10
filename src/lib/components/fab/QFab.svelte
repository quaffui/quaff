<!--
@component
Floating action buttons give a screen's primary action a prominent target. Use a clear icon and accessible label to identify the action.
-->

<script lang="ts">
  import QFabBase from "$internal/QFabBase.svelte";
  import type { QFabProps } from "./props";

  let props: QFabProps = $props();
</script>

<QFabBase {...props} />
