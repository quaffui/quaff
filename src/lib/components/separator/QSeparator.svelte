<script lang="ts">
  import { useColor, useSize } from "$composables";
  import type { QSeparatorProps } from "./props";

  // #region:    --- Props
  let {
    spacing = "none",
    inset = false,
    vertical = false,
    color = "outline-variant",
    size,
    text,
    textAlign = vertical ? "middle" : "center",
    ...props
  }: QSeparatorProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const orientation = $derived(vertical ? "vertical" : "horizontal");
  const qSpacing = $derived(useSize(spacing, "q-separator__spacing"));
  const qSize = $derived(size ? useSize(size) : undefined);
  const parsedColor = $derived(useColor(color));
  const insetSide = $derived(inset === true ? "both" : inset);
  // #endregion: --- Derived values

  Q.classes("q-separator", {
    bemClasses: {
      vertical,
    },
    classes: [qSpacing.class],
  });
  Q.classes("q-separator__wrapper", {
    bemClasses: {
      vertical,
      "inset-left": insetSide === "left",
      "inset-right": insetSide === "right",
      "inset-both": insetSide === "both",
    },
    classes: [props.class],
  });
</script>

<div
  {...props}
  class="q-separator__wrapper"
  data-quaff
  style:--q-separator-color={parsedColor}
  style:--q-separator-size={qSize?.style}
>
  {#if text}
    {#if (vertical && textAlign !== "top") || (!vertical && textAlign !== "left")}
      {@render hr()}
    {/if}

    <div class={vertical ? "q-py-sm" : "q-px-sm"}>{text}</div>

    {#if (vertical && textAlign !== "bottom") || (!vertical && textAlign !== "right")}
      {@render hr()}
    {/if}
  {:else}
    {@render hr()}
  {/if}
</div>

{#snippet hr()}
  <hr class="q-separator" aria-orientation={orientation} />
{/snippet}
