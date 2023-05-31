<script lang="ts">
  import { stringifyClasses, stringifyStyles } from "$lib/utils/props";
  import { type QLinearProgressProps } from "./props";

  export let value: QLinearProgressProps["value"] = 0,
    from: QLinearProgressProps["from"] = "left",
    rounded: QLinearProgressProps["rounded"] = false,
    userClasses: QLinearProgressProps["userClasses"] = undefined,
    userStyles: QLinearProgressProps["userStyles"] = undefined;
  export { userClasses as class };
  export { userStyles as style };

  $: roundedStyle = {
    borderRadius: rounded ? "12px" : "0",
  };

  $: containerClasses = stringifyClasses(["small-space", "border", userClasses]);
  $: progressClasses = stringifyClasses(["progress", from]);

  $: containerStyle = stringifyStyles(roundedStyle, userStyles);
  $: progressStyle =
    from === "right"
      ? `clip-path: polygon(100% 0%, 100% 100%, ${100 - value}% 100%, ${100 - value}% 0%);`
      : `clip-path: polygon(0% 0%, 0% 100%, ${value}% 100%, ${value}% 0%);`;
</script>

<div class={containerClasses} style={containerStyle} {...$$restProps}>
  <div class={progressClasses} style={progressStyle} />
</div>
