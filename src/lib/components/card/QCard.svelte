<script lang="ts">
  import type { QCardProps } from "./props";

  export let bordered: QCardProps["bordered"] = false,
    fill: QCardProps["fill"] = undefined,
    flat: QCardProps["flat"] = false,
    round: QCardProps["round"] = false,
    title: QCardProps["title"] = undefined,
    userClasses: QCardProps["userClasses"] = "";
  export { userClasses as class };

  const colorOptions: (typeof fill)[] = ["primary", "secondary", "tertiary"];

  $: color = !fill
    ? "surface"
    : colorOptions.includes(fill)
    ? `${fill}-container`
    : "surface-variant";
</script>

<article
  class="q-card {color} {userClasses}"
  class:q-card--bordered={bordered}
  class:q-card--flat={flat}
  class:q-card--rounded={round}
  {...$$restProps}
>
  {#if $$slots.title}
    <slot name="title" />
  {:else if title !== undefined}
    <h5 class="q-card__title">{title}</h5>
  {/if}

  <slot />
</article>
