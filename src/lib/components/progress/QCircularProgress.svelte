<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import { isNumber } from "$lib/utils/types";
  import type { QCircularProgressProps } from "./props";

  export let value: QCircularProgressProps["value"] = 0,
    indeterminate: QCircularProgressProps["indeterminate"] = false,
    size: QCircularProgressProps["size"] = "2em",
    color: QCircularProgressProps["color"] = undefined,
    thickness: QCircularProgressProps["thickness"] = 5,
    userClasses: QCircularProgressProps["userClasses"] = undefined;
  export { userClasses as class };

  $: spinnerSize = isNumber(size) ? `${size}px` : size;

  $: classes = createClasses([indeterminate && "indeterminate"], {
    component: "QCircularProgress",
    quaffClasses: [color && `${color}-text`],
    userClasses,
  });
</script>

<svg class={classes} height={spinnerSize} width={spinnerSize} viewBox="25 25 50 50">
  <circle
    class="path"
    cx="50"
    cy="50"
    r="20"
    fill="none"
    stroke="currentColor"
    stroke-width={thickness}
    stroke-miterlimit="10"
  />
</svg>
