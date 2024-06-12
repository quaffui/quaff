<script lang="ts">
  import type { CardProps } from "./props";

  let {
    title,
    fill = false,
    flat = false,
    bordered = false,
    rounded = false,
    children,
    ...props
  }: CardProps = $props();

  const colorOptions: (typeof fill)[] = ["primary", "secondary", "tertiary"];

  const color = $derived(
    !fill ? "surface" : colorOptions.includes(fill) ? `${fill}-container` : "surface-variant"
  );

  Quaff.classes("q-card", {
    bemClasses: {
      flat,
      bordered,
      rounded,
    },
    classes: [color, props.class],
  });
</script>

<article {...props} class="q-card" {...Quaff.classes}>
  {#if typeof title === "string"}
    <h5 class="q-card__title">{title}</h5>
  {:else}
    {@render title?.()}
  {/if}

  {@render children?.()}
</article>

<style lang="scss">
  @import "./card.scss";
</style>
