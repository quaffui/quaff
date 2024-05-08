<svelte:options runes={true} />

<script lang="ts">
  import type { QCardSectionProps } from "./props";

  let { horizontal = false, children, ...props }: QCardSectionProps = $props();

  __Quaff__.classes("q-card__section", {
    bemClasses: {
      horizontal,
    },
    classes: [props.class],
  });
</script>

<div {...props} class="q-card__section" {...__Quaff__.classes} class:row={horizontal}>
  {@render children?.()}
</div>

<style lang="scss">
  @import "./QCardSection.scss";
</style>
