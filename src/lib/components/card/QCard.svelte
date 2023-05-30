<script lang="ts">
  import { stringifyClasses, stringifyStyles } from "$utils/props";
  import { type QCardProps } from "./types";

  export let bordered: QCardProps["bordered"] = false,
    fill: QCardProps["fill"] = undefined,
    flat: QCardProps["flat"] = false,
    round: QCardProps["round"] = false,
    title: QCardProps["title"] = undefined,
    className: QCardProps["className"] = undefined,
    styleName: QCardProps["styleName"] = undefined;
  export { className as class };
  export { styleName as style };

  $: fillProp =
    fill === undefined || fill === false
      ? undefined
      : fill === true || fill === ""
      ? { class: "primary-container" }
      : fill.startsWith("#")
      ? { backgroundColor: fill }
      : ["primary", "secondary", "tertiary"].includes(fill)
      ? { class: `${fill}-container` }
      : { class: fill };

  $: classes = stringifyClasses([
    "q-card",
    bordered && "border",
    flat && "no-elevate",
    round && "round",
    className,
    fillProp?.class,
  ]);

  $: style = fillProp?.backgroundColor ? stringifyStyles(fillProp, styleName) : undefined;
</script>

<article class={classes} {...$$restProps} {style}>
  {#if $$slots.title}
    <slot name="title" />
  {:else if title !== undefined}
    <h5>{title}</h5>
  {/if}

  <slot />
</article>
