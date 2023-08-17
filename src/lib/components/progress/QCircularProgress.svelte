<script lang="ts">
  import { useSize } from "$lib/composables/use-size";
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

  $: spinnerSize = useSize(size);

  $: classes = createClasses([indeterminate && "indeterminate"], {
    component: "q-circular-progress",
    quaffClasses: [color && `${color}-text`],
    userClasses,
  });
</script>

<svg
  class={classes}
  height={spinnerSize.style}
  width={spinnerSize.style}
  viewBox="25 25 50 50"
  {...$$restProps}
>
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
