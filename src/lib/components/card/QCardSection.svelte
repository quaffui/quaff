<script lang="ts">
  import { stringifyClasses } from "$utils/props";
  import { type QCardSectionProps } from "./props";

  export let horizontal: QCardSectionProps["horizontal"] = false,
    userClasses: QCardSectionProps["userClasses"] = undefined;
  export { userClasses as class };

  $: classes = stringifyClasses(["q-card__section", "q-pa-sm", horizontal && "row", userClasses]);
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
