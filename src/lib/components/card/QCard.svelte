<script lang="ts">
  export let bordered: boolean = false,
    fill: string | boolean | undefined = undefined,
    flat: boolean = false,
    round: boolean = false,
    title: string | undefined = undefined;

  $: if (typeof fill === "string" && ["primary", "secondary", "tertiary"].includes(fill)) {
    fill = `var(--${fill})`;
  }

  $: fillColor =
    fill === undefined || fill === false
      ? undefined
      : fill === true || fill === ""
      ? "var(--primary)"
      : fill;

  $: classes =
    "q-card" +
    (bordered === true ? " border" : "") +
    (flat === true ? " no-elevate" : "") +
    (round === true ? " round" : "");
</script>

<article class={classes} {...$$restProps} style="background-color: {fillColor};">
  {#if $$slots.title}
    <slot name="title" />
  {:else if title !== undefined}
    <h5>{title}</h5>
  {/if}

  <slot />
</article>
