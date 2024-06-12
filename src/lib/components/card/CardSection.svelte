<script lang="ts">
  import type { CardSectionProps } from "./props";

  let { horizontal = false, children, ...props }: CardSectionProps = $props();

  Quaff.classes("q-card__section", {
    bemClasses: {
      horizontal,
    },
    classes: [props.class],
  });
</script>

<div {...props} class="q-card__section" {...Quaff.classes} class:row={horizontal}>
  {@render children?.()}
</div>

<style lang="scss">
  @import "./cardSection.scss";
</style>
