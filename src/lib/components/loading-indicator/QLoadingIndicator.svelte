<!--
@component
Show that content is loading during short waits with animated shapes.
-->

<script lang="ts">
  import { useColor, useSize } from "$composables";
  import type { QLoadingIndicatorProps } from "./props";

  // #region:    --- Props
  let {
    size = "3rem",
    contained = false,
    color,
    containerColor = "primary-container",
    ...props
  }: QLoadingIndicatorProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const qSize = $derived(useSize(size));
  const parsedColor = $derived(useColor(color ?? (contained ? "on-primary-container" : "primary")));
  const parsedContainerColor = $derived(useColor(containerColor));
  // #endregion: --- Derived values

  Q.classes("q-loading-indicator", {
    bemClasses: { contained },
    classes: [props.class],
  });
</script>

<span
  {...props}
  class="q-loading-indicator"
  style:--q-loading-indicator-size={qSize.style}
  style:--q-loading-indicator-color={parsedColor}
  style:--q-loading-indicator-container-color={parsedContainerColor}
  role="progressbar"
  aria-valuenow={undefined}
  data-quaff
>
  <span class="q-loading-indicator__rotation" aria-hidden="true">
    <span class="q-loading-indicator__shape"></span>
  </span>
</span>
