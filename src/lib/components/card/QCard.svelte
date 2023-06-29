<script lang="ts">
  import { createClasses, createStyles } from "$utils/props";
  import type { QCardProps } from "./props";

  export let bordered: QCardProps["bordered"] = false,
    fill: QCardProps["fill"] = undefined,
    flat: QCardProps["flat"] = false,
    round: QCardProps["round"] = false,
    title: QCardProps["title"] = undefined,
    userClasses: QCardProps["userClasses"] = undefined,
    userStyles: QCardProps["userStyles"] = undefined;
  export { userClasses as class };
  export { userStyles as style };

  let fillProp: { class?: string; backgroundColor?: string };
  $: fillProp =
    fill === undefined || fill === false
      ? {}
      : fill === true || fill === ""
      ? { class: "primary-container" }
      : fill.startsWith("#")
      ? { backgroundColor: fill }
      : ["primary", "secondary", "tertiary"].includes(fill)
      ? { class: `${fill}-container` }
      : { class: fill };

  $: classes = createClasses([
    "q-card",
    bordered && "border",
    flat && "no-elevate",
    round && "round",
    userClasses,
    fillProp?.class,
  ]);

  $: style = createStyles({ ...fillProp }, userStyles);
</script>

<article class={classes} {...$$restProps} {style}>
  {#if $$slots.title}
    <slot name="title" />
  {:else if title !== undefined}
    <h5>{title}</h5>
  {/if}

  <slot />
</article>
