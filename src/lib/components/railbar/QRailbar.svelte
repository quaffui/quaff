<script lang="ts">
  import { getContext } from "svelte";
  import type { QRailbarProps } from "./props";
  import type { DrawerContext } from "../layout/QLayout.svelte";
  import { createClasses, createStyles } from "$lib/utils/props";
  import { isNumber } from "$lib/utils/types";

  export let width: QRailbarProps["width"] = 88,
    side: QRailbarProps["side"] = "left",
    bordered: QRailbarProps["bordered"] = false,
    userClasses: QRailbarProps["userClasses"] = undefined,
    userStyles: QRailbarProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  $: ctx = getContext<DrawerContext | undefined>(side === "left" ? "drawerLeft" : "drawerRight");

  $: classes = createClasses([
    "q-railbar",
    "surface",
    side,
    bordered && "bordered",
    ctx?.offset?.top && "offset-top",
    ctx?.offset?.bottom && "offset-bottom",
    ctx?.fixed && "fixed",
    getBorderRadiusClasses(side, ctx),
    userClasses,
  ]);

  $: widthStyle = ctx === undefined ? (isNumber(width) ? `${width}px` : width) : undefined;

  $: style = createStyles(
    {
      [`--${side}-railbar-width`]: widthStyle,
    },
    userStyles
  );

  function getBorderRadiusClasses(sideProp: typeof side, context: typeof ctx) {
    let prefix = "border-radius" + (sideProp === "left" ? "__right" : "__left");
    return createClasses([
      context?.offset?.top !== false && context?.drawer === false ? prefix + "--top" : undefined,
      context?.offset?.bottom !== false && context?.drawer === false
        ? prefix + "--bottom"
        : undefined,
    ]);
  }
</script>

<nav class={classes} {style}>
  <slot />
</nav>
