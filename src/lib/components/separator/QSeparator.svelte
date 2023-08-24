<script lang="ts">
  import { useSize } from "$lib/composables";
import { createStyles, createClasses } from "$lib/utils";
import type { QSeparatorProps } from "./props";

export let spacing: QSeparatorProps["spacing"] = "none",
  inset: QSeparatorProps["inset"] = false,
  vertical: QSeparatorProps["vertical"] = false,
  color: QSeparatorProps["color"] = undefined,
  size: QSeparatorProps["size"] = undefined,
  text: QSeparatorProps["text"] = undefined,
  textAlign: QSeparatorProps["textAlign"] = vertical === true ? "middle" : "center",
  userClasses: QSeparatorProps["userClasses"] = undefined;
export { userClasses as class };

let orientation: "vertical" | "horizontal";
$: orientation = vertical ? "vertical" : "horizontal"

$: spacingClass = useSize(spacing).class

$: classes = createClasses([
  vertical && "vertical",
  `spacing-${spacingClass}`,
], {
  component: "q-separator",
  quaffClasses: [
    color && `bg-${color}`
  ],
});
</script>

{#if text}
<div
  class="q-separator__wrapper {userClasses || ''}"
  class:q-separator--vertical__wrapper={vertical}
  class:q-separator--inset__wrapper={inset}
  {...$$restProps}
>
  {#if (vertical === true && textAlign !== "top") || (vertical === false && textAlign !== "left")}
    <hr
      class={classes}
      style:--q-separator--size={size}
      aria-orientation={orientation}
    />
  {/if}
  <div class={vertical ? "q-py-sm" : "q-px-sm"}>{text}</div>
  {#if (vertical === true && textAlign !== "bottom") || (vertical === false && textAlign !== "right")}
    <hr
      class={classes}
      style:--q-separator--size={size}
      aria-orientation={orientation}
    />
  {/if}
</div>
{:else}
<div
  class="q-separator__wrapper {userClasses || ''}"
  class:q-separator--vertical__wrapper={vertical}
  class:q-separator--inset__wrapper={inset}
  {...$$restProps}
>
  <hr
    class={classes}
    style:--q-separator--size={size}
    aria-orientation={orientation}
  />
</div>
{/if}