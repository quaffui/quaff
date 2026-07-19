<script lang="ts">
  import { quaffConfig } from "$internal/quaffConfig";
  import QBtn from "./QBtn.svelte";
  import type { QIconBtnProps } from "./props";

  let {
    width = "default",
    expressive = false,
    selected = $bindable(),
    icon,
    children,
    ...props
  }: QIconBtnProps = $props();

  const isExpressive = $derived(expressive || quaffConfig.expressive);
  const resolvedIcon = $derived(icon ?? children);

  Q.classes("q-icon-btn", {
    bemClasses: {
      [width]: isExpressive,
    },
    classes: [props.class],
  });
</script>

<QBtn {...props} expressive={isExpressive} bind:selected icon={resolvedIcon} class="q-icon-btn" />
