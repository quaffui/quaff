<script lang="ts">
  import { createClasses } from "$lib/utils";
  import type { QCardProps } from "./props";

  export let bordered: QCardProps["bordered"] = false,
    fill: QCardProps["fill"] = undefined,
    flat: QCardProps["flat"] = false,
    round: QCardProps["round"] = false,
    title: QCardProps["title"] = undefined,
    userClasses: QCardProps["userClasses"] = undefined;
  export { userClasses as class };

  const colorOptions: (typeof fill)[] = ["primary", "secondary", "tertiary"];

  $: color = !fill
    ? "surface"
    : colorOptions.includes(fill)
    ? `${fill}-container`
    : "surface-variant";

  $: classes = createClasses([bordered && "bordered", flat && "flat", round && "rounded"], {
    component: "q-card",
    quaffClasses: [color],
    userClasses,
  });
</script>

<article class={classes} {...$$restProps}>
  {#if $$slots.title}
    <slot name="title" />
  {:else if title !== undefined}
    <h5 class="q-card__title">{title}</h5>
  {/if}

  <slot />
</article>
