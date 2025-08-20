<script lang="ts">
  import { useSize } from "$composables";
  import type { QSeparatorProps } from "./props";

  // #region:    --- Props
  let {
    spacing = "none",
    inset = false,
    vertical = false,
    color = "outline",
    size,
    text,
    textAlign = vertical ? "middle" : "center",
    ...props
  }: QSeparatorProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const orientation = $derived(vertical ? "vertical" : "horizontal");
  const qSize = $derived(useSize(spacing, "q-separator__spacing"));
  // #endregion: --- Derived values

  Q.classes("q-separator", {
    bemClasses: {
      vertical,
    },
    classes: [`bg-${color}`, qSize.class],
  });
  Q.classes("q-separator__wrapper", {
    bemClasses: {
      vertical,
      inset,
    },
    classes: [props.class],
  });
</script>

<div {...props} class="q-separator__wrapper" data-quaff>
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
  <hr class="q-separator" style:--q-separator-size={size} aria-orientation={orientation} />
{/snippet}
