<script lang="ts">
  import { createClasses } from "$lib/utils";
  import type { QTooltipProps } from "./props";

  export let value: QTooltipProps["value"] = undefined,
    position: QTooltipProps["position"] = "bottom",
    userClasses: QTooltipProps["userClasses"] = "";
  export { userClasses as class };

  $: classes = createClasses([value && "active", position || "top"], {
    component: "q-tooltip",
    userClasses,
  });
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
