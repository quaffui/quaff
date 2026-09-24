<!--
@component
Icon buttons are buttons that contain only icons (no text labels) and are typically used in toolbars, navigation bars, or as action buttons.
-->

<script lang="ts">
  import { buttonGroupCtx } from "$components/button-group/QBtnGroup.svelte";
  import { quaffConfig } from "$internal/quaffConfig";
  import QBtn from "./QBtn.svelte";
  import type { QIconBtnProps } from "./props";

  let {
    width = "default",
    expressive,
    selected = $bindable(),
    icon,
    children,
    ...props
  }: QIconBtnProps = $props();

  const group = buttonGroupCtx.get();
  const isExpressive = $derived(expressive ?? group?.isExpressive ?? quaffConfig.expressive);
  const resolvedIcon = $derived(icon ?? children);

  Q.classes("q-icon-btn", {
    bemClasses: {
      [width]: isExpressive,
    },
    classes: [props.class],
  });
</script>

<QBtn {...props} expressive={isExpressive} bind:selected icon={resolvedIcon} class="q-icon-btn" />
