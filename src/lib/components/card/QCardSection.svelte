<script lang="ts">
  import { createClasses } from "$utils/props";
  import type { QCardSectionProps } from "./props";

  export let horizontal: QCardSectionProps["horizontal"] = false,
    userClasses: QCardSectionProps["userClasses"] = undefined;
  export { userClasses as class };

  $: classes = createClasses(["q-card__section", "q-pa-sm", horizontal && "row", userClasses]);
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
