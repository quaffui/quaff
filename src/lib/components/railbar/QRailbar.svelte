<script lang="ts">
  import { getContext } from "svelte";
  import type { QRailbarProps } from "./props";
  import type { DrawerContext, LayoutContext } from "../layout/QLayout.svelte";
  import { createClasses, createStyles } from "$lib/utils/props";
  import { isNumber } from "$lib/utils/types";

  export let width: QRailbarProps["width"] = 88,
    side: QRailbarProps["side"] = "left",
    bordered: QRailbarProps["bordered"] = false,
    userClasses: QRailbarProps["userClasses"] = undefined,
    userStyles: QRailbarProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  let ctx = getContext<LayoutContext | undefined>("layout");

  let drawerType: "drawerLeft" | "drawerRight";
  $: drawerType = side === "left" ? "drawerLeft" : "drawerRight";

  $: classes = createClasses([
    "q-railbar",
    "surface",
    side,
    bordered && "bordered",
    $ctx && $ctx[drawerType].offset.top && "offset-top",
    $ctx && $ctx[drawerType].offset.bottom && "offset-bottom",
    $ctx && $ctx[drawerType].fixed && "fixed",
    getBorderRadiusClasses(side, $ctx),
    userClasses,
  ]);

  $: widthStyle = ctx === undefined ? (isNumber(width) ? `${width}px` : width) : undefined;

  $: style = createStyles(
    {
      [`--${side}-railbar-width`]: widthStyle,
    },
    userStyles
  );

  function getBorderRadiusClasses(sideProp: typeof side, context: typeof $ctx) {
    let prefix = "border-radius" + (sideProp === "left" ? "__right" : "__left");
    return createClasses([
      context &&
      context[drawerType].offset.top !== false &&
      context &&
      context[drawerType].drawer === false
        ? prefix + "--top"
        : undefined,
      context &&
      context[drawerType].offset.bottom !== false &&
      context &&
      context[drawerType].drawer === false
        ? prefix + "--bottom"
        : undefined,
    ]);
  }
</script>

<nav class={classes} {style}>
  <slot />
</nav>
