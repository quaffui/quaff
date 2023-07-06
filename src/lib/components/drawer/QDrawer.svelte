<script lang="ts">
  import { navigating } from "$app/stores";
  import { createClasses, createStyles } from "$lib/utils/props";
  import { getContext } from "svelte";
  import type { QDrawerProps } from "./props";
  import type { DrawerContext, LayoutContext } from "../layout/QLayout.svelte";
  import { clickOutside } from "$lib/helpers";

  export let value: QDrawerProps["value"] = true,
    side: QDrawerProps["side"] = "left",
    width: QDrawerProps["width"] = 300,
    breakpoint: QDrawerProps["breakpoint"] = 1023,
    showIfAbove: QDrawerProps["showIfAbove"] = false,
    behavior: QDrawerProps["behavior"] = "default",
    bordered: QDrawerProps["bordered"] = false,
    elevated: QDrawerProps["elevated"] = false,
    overlay: QDrawerProps["overlay"] = false,
    persistent: QDrawerProps["persistent"] = false,
    noSwipeOpen: QDrawerProps["noSwipeOpen"] = false,
    noSwipeClose: QDrawerProps["noSwipeClose"] = false,
    noSwipeBackdrop: QDrawerProps["noSwipeBackdrop"] = false,
    userClasses: QDrawerProps["userClasses"] = undefined,
    userStyles: QDrawerProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  let canHideOnClickOutside = false;

  $: belowBreakpoint =
    (behavior === "mobile") === true ||
    (behavior !== "desktop" && /** TODO: Get Layout width */ 1300 <= breakpoint!);

  $: widthStyle = ctx === undefined ? (isNaN(Number(width)) ? width : `${width}px`) : undefined;

  $: hideOnRouteChange = persistent !== true || overlay === true;

  $: if (value === true && persistent !== true) {
    setTimeout(() => {
      canHideOnClickOutside = true;
    }, 50);
  } else {
    canHideOnClickOutside = false;
  }

  export const show = () => {
    if (value === true) return;

    value = true;
  };

  export const hide = () => {
    if (value === false) return;

    canHideOnClickOutside = false;
    value = false;
  };

  export const toggle = () => {
    value = !value;
  };

  $: if ($navigating && hideOnRouteChange) {
    hide();
  }

  let ctx = getContext<LayoutContext | undefined>("layout");

  let drawerType: "drawerLeft" | "drawerRight";
  $: drawerType = side === "left" ? "drawerLeft" : "drawerRight";

  $: classes = createClasses([
    "q-drawer",
    "surface",
    side,
    value && "active",
    overlay && "overlay",
    bordered && "bordered",
    $ctx && $ctx[drawerType].offset.top && "offset-top",
    $ctx && $ctx[drawerType].offset.bottom && "offset-bottom",
    $ctx && $ctx[drawerType].fixed && "fixed",
    getBorderRadiusClasses(side, $ctx),
    userClasses,
  ]);

  $: style = createStyles(
    {
      [side === "left" ? "--leftDrawerWidth" : "--rightDrawerWidth"]: widthStyle,
    },
    userStyles
  );

  function getBorderRadiusClasses(sideProp: typeof side, context: typeof $ctx) {
    let prefix = "border-radius" + (sideProp === "left" ? "__right" : "__left");
    return createClasses([
      context && context[drawerType].offset.top !== false ? prefix + "--top" : undefined,
      context && context[drawerType].offset.bottom !== false ? prefix + "--bottom" : undefined,
    ]);
  }
</script>

<div
  use:clickOutside={() => (canHideOnClickOutside === true ? hide() : null)}
  class={classes}
  {style}
>
  <slot />
</div>
