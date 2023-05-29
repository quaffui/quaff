<script lang="ts">
  import { stringifyClasses } from "$lib/utils/props";

  export let bordered: boolean = false,
    fill: string | boolean | undefined = undefined,
    flat: boolean = false,
    round: boolean = false,
    title: string | undefined = undefined,
    className: string = "";
  export { className as class };

  $: if (typeof fill === "string" && ["primary", "secondary", "tertiary"].includes(fill)) {
    fill = `var(--${fill})`;
  }

  $: fillColor =
    fill === undefined || fill === false
      ? undefined
      : fill === true || fill === ""
      ? "var(--primary)"
      : fill;

  $: classes = stringifyClasses([
    "q-card",
    bordered && "border",
    flat && "no-elevate",
    round && "round",
    className,
  ]);
</script>

<article class={classes} {...$$restProps} style="background-color: {fillColor};">
  {#if $$slots.title}
    <slot name="title" />
  {:else if title !== undefined}
    <h5>{title}</h5>
  {/if}

  <slot />
</article>
