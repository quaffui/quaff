<script lang="ts">
  import { type QTooltipProps } from "./props";

  export let position: QTooltipProps["position"] = "bottom",
    userClasses: QTooltipProps["userClasses"] = "";
  export { userClasses as class };
</script>

<div class={`tooltip ${position}`}>
  <slot />
</div>
