<script lang="ts">
  import type { QLinearProgressProps } from "./props";

  export let value: QLinearProgressProps["value"] = 0,
    from: QLinearProgressProps["from"] = "left",
    rounded: QLinearProgressProps["rounded"] = false,
    userClasses: QLinearProgressProps["userClasses"] = "";
  export { userClasses as class };
</script>

<div
  class="q-linear-progress {userClasses}"
  class:q-linear-progress--rounded={rounded}
  class:q-linear-progress--right={from === "right"}
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={100}
  {...$$restProps}
>
  <div
    class="q-linear-progress__progress"
    class:q-linear-progress__progress--right={from === "right"}
    style="--progress:{value}%"
  />
</div>
