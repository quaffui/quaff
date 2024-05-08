<svelte:options runes={true} />

<script lang="ts">
  import type { QCardProps } from "./props";

  let {
    title,
    fill = false,
    flat = false,
    bordered = false,
    rounded = false,
    children,
    ...props
  }: QCardProps = $props();

  const colorOptions: (typeof fill)[] = ["primary", "secondary", "tertiary"];

  const color = $derived(
    !fill ? "surface" : colorOptions.includes(fill) ? `${fill}-container` : "surface-variant"
  );

  __Quaff__.classes("q-card", {
    bemClasses: {
      flat,
      bordered,
      rounded,
    },
    classes: [color, props.class],
  });
</script>

<article {...props} class="q-card" {...__Quaff__.classes}>
  {#if typeof title === "string"}
    <h5 class="q-card__title">{title}</h5>
  {:else}
    {@render title?.()}
  {/if}

  {@render children?.()}
</article>

<style lang="scss">
  @import "./QCard.scss";
</style>
