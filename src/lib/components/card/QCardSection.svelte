<script lang="ts">
  import { stringifyClasses } from "$utils/props";
  import { type QCardSectionProps } from "./types";

  export let horizontal: QCardSectionProps["horizontal"] = false,
    className: QCardSectionProps["className"] = undefined;
  export { className as class };

  $: classes = stringifyClasses(["q-card__section", "q-pa-sm", horizontal && "row", className]);
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
