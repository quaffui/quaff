<script lang="ts">
  import { createClasses } from "$lib/utils";
  import type { QCardSectionProps } from "./props";

  export let horizontal: QCardSectionProps["horizontal"] = false,
    userClasses: QCardSectionProps["userClasses"] = undefined;
  export { userClasses as class };

  $: classes = createClasses([horizontal && "horizontal"], {
    component: "q-card",
    element: "section",
    userClasses,
  });
</script>

<div class={classes} {...$$restProps} on:scroll>
  <slot />
</div>
