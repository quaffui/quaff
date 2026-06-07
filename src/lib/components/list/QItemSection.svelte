<script lang="ts">
  import { itemCtx } from "./QItem.svelte";
  import type { Snippet } from "svelte";
  import type { QItemSectionProps } from "./props";

  // #region:    --- Props
  let {
    type = "content",
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
      ctx.multiline = !!headline && [line1, line2, line3].filter(Boolean).length >= 2;
    }
  });
  // #endregion: --- Effects

  Q.classes("q-item__section", {
    bemClasses: {
      [type]: true,
      trailing: type === "trailingText",
    },
    classes: [props.class],
  });
</script>

<div {...props} class="q-item__section" data-quaff>
  {#if type === "content"}
    {#if headline || line1 || line2 || line3}
      {@render line(headline, true)}

      {@render line(line1)}

      {@render line(line2)}

      {@render line(line3)}
    {/if}
  {:else if type === "trailingText"}
    <div class={["label-small", ctx.activeClass]}>
      {@render children?.()}
    </div>
  {:else if type === "side"}
    {@render children?.()}
  {:else}
    <div class={ctx.activeClass || undefined}>
      {@render children?.()}
    </div>
  {/if}
</div>

{#snippet line(snip: Snippet | undefined, isHeadline = false)}
  {#if snip}
    <div class={[isHeadline && "q-item__section--headline", ctx.activeClass]}>
      {@render snip()}
    </div>
  {/if}
{/snippet}
