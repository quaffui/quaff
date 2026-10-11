<!--
@component
Icon buttons present familiar actions in a compact form. They can trigger an action or toggle a selection, and need an accessible name.
-->

<script lang="ts">
  import { buttonGroupCtx } from "#components/button-group/QBtnGroup.svelte";
  import { useQuaffConfig } from "#internal/quaffConfig.svelte.js";
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
  const quaffConfig = useQuaffConfig();
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
