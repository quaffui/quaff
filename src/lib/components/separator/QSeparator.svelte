<script lang="ts">
  import { useSize } from "$lib/composables/useSize";
  import type { QSeparatorProps } from "./props";

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

  const orientation = $derived(vertical ? "vertical" : "horizontal");
  const qSize = $derived(useSize(spacing, "q-separator__spacing"));

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

<div {...props} class="q-separator__wrapper" {...Q.classes} data-quaff>
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
    {...Q.classes}
    style:--q-separator-size={size}
    aria-orientation={orientation}
  />
{/snippet}
