<script lang="ts">
  import type { QTooltipProps } from "./props";

  export let value: QTooltipProps["value"] = undefined,
    position: QTooltipProps["position"] = "bottom",
    userClasses: QTooltipProps["userClasses"] = "";
  export { userClasses as class };
</script>

<div class="q-tooltip {position} {userClasses}" class:q-tooltip--active={value} {...$$restProps}>
  <slot />
</div>
