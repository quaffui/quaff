<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import type { QItemSectionProps } from "./props";

  export let type: QItemSectionProps["type"] = "content",
    userClasses: QItemSectionProps["userClasses"] = "";
  export { userClasses as class };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  $: ctx = getContext<Writable<boolean>>("hasMultipleLines");

  $: if (type === "content") {
    $ctx =
      $$slots.headline && [$$slots.line1, $$slots.line2, $$slots.line3].filter(Boolean).length >= 2;
  }
</script>

<div class="q-item__section q-item__section--{type} {userClasses}" {...$$restProps}>
  {#if type === "content"}
    {#if ![$$slots.headline, $$slots.line2, $$slots.line2, $$slots.line3].some(Boolean)}
      <slot />
    {:else}
      {#if $$slots.headline}
        <div class="body-large text-on-surface">
          <slot name="headline" />
        </div>
      {/if}
      <div class="body-medium text-on-surface-variant">
        {#if $$slots.line1}
          <slot name="line1" />
        {/if}
      </div>
      {#if $$slots.line2}
        <div class="body-medium text-on-surface-variant">
          <slot name="line2" />
        </div>
      {/if}
      {#if $$slots.line3}
        <div class="body-medium text-on-surface-variant">
          <slot name="line3" />
        </div>
      {/if}
    {/if}
  {:else if type === "trailingText"}
    <div class="label-small text-on-surface-variant">
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</div>
