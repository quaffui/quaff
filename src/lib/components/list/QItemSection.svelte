<script lang="ts">
  import QContext from "$lib/classes/QContext.svelte";
  import type { Snippet } from "svelte";
  import "./QItemSection.scss";
  import type { QItemSectionProps } from "./props";

  let {
    type = "content",
    children,
    headline = children,
    line1,
    line2,
    line3,
    ...props
  }: QItemSectionProps = $props();

  const multiline = QContext.get<boolean>("multiline");

  $effect(() => {
    if (type === "content") {
      multiline?.update(!!headline && [line1, line2, line3].filter(Boolean).length >= 2);
    }
  });

  function getClass(snip: Snippet) {
    return snip === headline ? "body-large text-on-surface" : "body-medium text-on-surface-variant";
  }

  Q.classes("q-item__section", {
    bemClasses: {
      [type]: true,
    },
    classes: [props.class],
  });
</script>

<div {...props} class="q-item__section" {...Q.classes}>
  {#if type === "content"}
    {#if !headline && !line1 && !line2 && !line3}
      {@render children?.()}
    {:else}
      {@render line(headline)}

      {@render line(line1)}

      {@render line(line2)}

      {@render line(line3)}
    {/if}
  {:else if type === "trailingText"}
    <div class="label-small text-on-surface-variant">
      {@render children?.()}
    </div>
  {:else}
    {@render children?.()}
  {/if}
</div>

{#snippet line(snip: Snippet | undefined)}
  {#if snip}
    <div class={getClass(snip)}>
      {@render snip()}
    </div>
  {/if}
{/snippet}
