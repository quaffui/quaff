<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import type { QTooltipProps } from "./props";

  export let value: QTooltipProps["value"] = undefined,
    position: QTooltipProps["position"] = "bottom",
    userClasses: QTooltipProps["userClasses"] = "";
  export { userClasses as class };

  $: classes = createClasses([
    "q-tooltip tooltip",
    value !== false && "active",
    position,
    userClasses,
  ]);
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
