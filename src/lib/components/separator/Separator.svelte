<script lang="ts">
  import { useSize } from "$lib/composables/use-size";
  import type { SeparatorProps } from "./props";

  let {
    spacing = "none",
    inset = false,
    vertical = false,
    color = "outline",
    size,
    text,
    textAlign = vertical ? "middle" : "center",
    ...props
  }: SeparatorProps = $props();

  const orientation = $derived(vertical ? "vertical" : "horizontal");
  const kSpacing = $derived(useSize(spacing, "q-separator__spacing"));

  Quaff.classes("q-separator", {
    bemClasses: {
      vertical,
    },
    classes: [`bg-${color}`, kSpacing.class],
  });
  Quaff.classes("q-separator__wrapper", {
    bemClasses: {
      vertical,
      inset,
    },
    classes: [props.class],
  });
</script>

<div {...props} class="q-separator__wrapper" {...Quaff.classes}>
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
  <hr
    class="q-separator"
    {...Quaff.classes}
    style:--q-separator-size={size}
    aria-orientation={orientation}
  />
{/snippet}

<style lang="scss">
  @import "./separator.scss";
</style>
