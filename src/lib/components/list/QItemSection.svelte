<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import { getContext } from "svelte";
  import type { QItemSectionProps } from "./props";
  import type { Writable } from "svelte/store";

  export let type: QItemSectionProps["type"] = "content",
    userClasses: QItemSectionProps["userClasses"] = undefined;
  export { userClasses as class };

  $: ctx = getContext<Writable<boolean>>("hasMultipleLines");

  $: if (type === "content") {
    $ctx =
      $$slots.headline && [$$slots.line1, $$slots.line2, $$slots.line3].filter(Boolean).length >= 2;
  }

  $: classes = createClasses([type], {
    component: "q-item__section",
    userClasses,
  });
</script>

<div class={classes} {...$$restProps}>
  {#if type === "content"}
    {#if [$$slots.headline, $$slots.line2, $$slots.line2, $$slots.line3].some(Boolean) === false}
      <slot />
    {:else}
      {#if $$slots.headline}
        <div class="body-large on-surface-text">
          <slot name="headline" />
        </div>
      {/if}
      <div class="body-medium on-surface-variant-text">
        {#if $$slots.line1}
          <slot name="line1" />
        {/if}
      </div>
      {#if $$slots.line2}
        <div class="body-medium on-surface-variant-text">
          <slot name="line2" />
        </div>
      {/if}
      {#if $$slots.line3}
        <div class="body-medium on-surface-variant-text">
          <slot name="line3" />
        </div>
      {/if}
    {/if}
  {:else if type === "trailingText"}
    <div class="label-small on-surface-variant-text">
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</div>
