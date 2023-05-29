<script lang="ts">
  export let bordered: boolean = false,
    fill: string | boolean | undefined,
    flat: boolean = false,
    round: boolean = false,
    title: string | undefined,
    className: string | undefined;

  $: if (typeof fill === "string" && ["primary", "secondary", "tertiary"].includes(fill)) {
    fill = `var(--${fill})`;
  }

  $: fillColor =
    fill === undefined || fill === false
      ? undefined
      : fill === true || fill === ""
      ? "var(--primary)"
      : fill;

  $: classes = [
    "q-card",
    bordered && "border",
    flat && "no-elevate",
    round && "round",
    className
  ].filter(Boolean).join(" ");

  export {className as class};
</script>

<article class={classes} {...$$restProps} style="background-color: {fillColor};">
  {#if $$slots.title}
    <slot name="title" />
  {:else if title !== undefined}
    <h5>{title}</h5>
  {/if}

  <slot />
</article>
