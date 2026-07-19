<script lang="ts">
  import { ripple } from "$helpers";
  import { itemCtx } from "./QItem.svelte";
  import type { Snippet } from "svelte";
  import type { QItemSectionProps } from "./props";

  // #region:    --- Props
  let {
    type = "content",
    action = false,
    dragHandle = false,
    leading,
    children,
    headline = children,
    line1,
    line2,
    line3,
    ...props
  }: QItemSectionProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  const ctx = itemCtx.assertGet();
  // #endregion: --- Reactive variables

  // #region:    --- Effects
  $effect(() => {
    if (type === "content") {
      ctx.lineCount = [headline, line1, line2, line3].filter(Boolean).length;
    }
  });
  // #endregion: --- Effects

  Q.classes("q-item__section", {
    bemClasses: {
      [type]: true,
      action,
      "drag-handle": dragHandle,
      "has-leading": action && !!leading,
      trailing: type === "trailingText",
    },
    classes: [props.class],
  });
</script>

<svelte:element
  this={action ? "button" : "div"}
  {...props}
  class="q-item__section"
  type={action ? "button" : undefined}
  {@attach ripple({ disabled: !action })}
  data-quaff
>
  {#if type === "content"}
    {#if action && leading}
      <div class="q-item__section--action-leading">{@render leading()}</div>
      <div class="q-item__section q-item__section--content">{@render content()}</div>
    {:else}
      {@render content()}
    {/if}
  {:else if type === "side"}
    {@render children?.()}
  {:else}
    <div class={ctx.activeClass}>
      {@render children?.()}
    </div>
  {/if}
</svelte:element>

{#snippet content()}
  {#if headline || line1 || line2 || line3}
    {@render line(headline, true)}

    {@render line(line1)}

    {@render line(line2)}

    {@render line(line3)}
  {/if}
{/snippet}

{#snippet line(snip: Snippet | undefined, isHeadline = false)}
  {#if snip}
    <div class={[isHeadline && "q-item__section--headline", ctx.activeClass]}>
      {@render snip()}
    </div>
  {/if}
{/snippet}
