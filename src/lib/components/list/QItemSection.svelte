<script lang="ts">
  import { QContext } from "$lib/classes/QContext.svelte";
  import { getContext, type Snippet } from "svelte";
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

  const activeClass = getContext<() => string>("itemActiveClass");

  const multiline = QContext.get<boolean>("multiline");

  $effect(() => {
    if (type === "content") {
      multiline?.update(!!headline && [line1, line2, line3].filter(Boolean).length >= 2);
    }
  });

  function getClass(snip: Snippet) {
    return snip === headline ? "q-item__section--headline" : undefined;
  }

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
    {#if !headline && !line1 && !line2 && !line3}
      {@render children?.()}
    {:else}
      {@render line(headline)}

      {@render line(line1)}

      {@render line(line2)}

      {@render line(line3)}
    {/if}
  {:else if type === "trailingText"}
    <div class={["label-small", activeClass()]}>
      {@render children?.()}
    </div>
  {:else}
    <div class={activeClass() || undefined}>
      {@render children?.()}
    </div>
  {/if}
</div>

{#snippet line(snip: Snippet | undefined)}
  {#if snip}
    <div class={[getClass(snip), activeClass()]}>
      {@render snip()}
    </div>
  {/if}
{/snippet}
