<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import { type QTooltipProps } from "./props";

  export let position: QTooltipProps["position"] = "bottom",
    userClasses: QTooltipProps["userClasses"] = "";
  export { userClasses as class };

  $: classes = createClasses(["tooltip", position, userClasses]);
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
