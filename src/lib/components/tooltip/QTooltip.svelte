<script lang="ts">
  import type { QTooltipProps } from "./props";

  export let value: QTooltipProps["value"] = undefined,
    position: QTooltipProps["position"] = "bottom",
    userClasses: QTooltipProps["userClasses"] = "";
  export { userClasses as class };
</script>

<div
  class="q-tooltip {userClasses}"
  class:q-tooltip--top={position === "top"}
  class:q-tooltip--right={position === "right"}
  class:q-tooltip--bottom={position === "bottom"}
  class:q-tooltip--left={position === "left"}
  class:q-tooltip--active={value}
  {...$$restProps}
>
  <slot />
</div>
