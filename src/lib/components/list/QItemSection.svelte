<!--
@component
The QItemSection component is used inside QItem to separate different types of information.
-->

<script lang="ts">
  import { ripple } from "#helpers";
  import { menuCtx } from "#internal/menuContext.js";
  import { itemCtx } from "./QItem.svelte";
  import { listCtx } from "./QList.svelte";
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
  const inMenu = menuCtx.get();
  const ctx = itemCtx.assertGet();
  const list = listCtx.assertGet();
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const lineCount = $derived(
    type === "content" ? [headline, line1, line2, line3].filter(Boolean).length : 0
  );
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect(() => {
    // Keep the row modifiers available after hydration, including in nested lists.
    if (lineCount > 1) {
      return ctx.registerSectionLineCount(lineCount);
    }
  });

  $effect(() => {
    void [
      action,
      type,
      leading,
      headline,
      line1,
      line2,
      line3,
      children,
      props.tabindex,
      props["aria-disabled"],
    ];
    list.refreshTabStop();

    return list.refreshTabStop;
  });
  // #endregion: --- Effects

  Q.classes("q-item__section", {
    bemClasses: {
      [type]: true,
      action,
      "drag-handle": dragHandle,
      "has-leading": action && !!leading,
      trailing: type === "trailingText",
      multiline: lineCount > 1,
      "three-line": lineCount > 2,
    },
    classes: [props.class],
  });
</script>

<svelte:element
  this={action ? "button" : "div"}
  {...props}
  class="q-item__section"
  type={action ? "button" : undefined}
  {@attach ripple({
    disabled: !action,
    effectTarget: inMenu ? ".q-item__action-surface" : undefined,
  })}
  data-quaff
>
  {#if action && inMenu}
    <span class="q-item__action-surface" aria-hidden="true"></span>
  {/if}
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
