<script lang="ts">
  import { createStyles } from "$lib/utils";
  import type { QLinearProgressProps } from "./props";

  export let value: QLinearProgressProps["value"] = 0,
    from: QLinearProgressProps["from"] = "left",
    rounded: QLinearProgressProps["rounded"] = false,
    userClasses: QLinearProgressProps["userClasses"] = undefined,
    userStyles: QLinearProgressProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  $: roundedStyle = {
    borderRadius: rounded ? "12px" : "0",
  };

  $: containerStyle = createStyles(roundedStyle, userStyles);
  $: progressStyle =
    from === "right"
      ? `clip-path: polygon(100% 0%, 100% 100%, ${100 - value}% 100%, ${100 - value}% 0%);`
      : `clip-path: polygon(0% 0%, 0% 100%, ${value}% 100%, ${value}% 0%);`;
</script>

<div
  class="q-linear-progress {userClasses}"
  style={containerStyle}
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={100}
  {...$$restProps}
>
  <div
    class="q-linear-progress__progress"
    class:q-linear-progress__progress--right={from === "right"}
    style={progressStyle}
  />
</div>
