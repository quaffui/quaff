<script lang="ts">
  import type { QCardSectionProps } from "./props";

  export let horizontal: QCardSectionProps["horizontal"] = false,
    userClasses: QCardSectionProps["userClasses"] = "";
  export { userClasses as class };
</script>

<div
  class="q-card__section {userClasses}"
  class:q-card__section--horizontal={horizontal}
  {...$$restProps}
  on:scroll
>
  <slot />
</div>
