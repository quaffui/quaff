<script lang="ts">
  import { useSize } from "$lib/composables";
  import { createClasses } from "$lib/utils";
  import type { QCircularProgressProps } from "./props";

  export let value: QCircularProgressProps["value"] = 0,
    indeterminate: QCircularProgressProps["indeterminate"] = false,
    size: QCircularProgressProps["size"] = "2rem",
    color: QCircularProgressProps["color"] = undefined,
    thickness: QCircularProgressProps["thickness"] = 5,
    userClasses: QCircularProgressProps["userClasses"] = undefined;
  export { userClasses as class };

  $: spinnerSize = useSize(size);

  $: classes = createClasses([indeterminate && "indeterminate"], {
    component: "q-circular-progress",
    quaffClasses: [color && `text-${color}`],
    userClasses,
  });

  $: circumference = 2 * Math.PI * 20;

  $: progressOffset = ((100 - value) / 100) * circumference;
</script>

<svg
  class={classes}
  height={spinnerSize.style}
  width={spinnerSize.style}
  viewBox="25 25 50 50"
  style="transform: rotate3d(0, 0, 1, -90deg);"
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={100}
  {...$$restProps}
>
  <circle
    class="q-circular-progress__path"
    cx="50"
    cy="50"
    r="20"
    fill="none"
    stroke="currentColor"
    stroke-width={thickness}
    stroke-miterlimit="10"
    stroke-dasharray={circumference}
    stroke-dashoffset={progressOffset}
  />
</svg>
