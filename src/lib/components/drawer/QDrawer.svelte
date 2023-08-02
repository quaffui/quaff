<script lang="ts">
  import { navigating } from "$app/stores";
  import { createClasses, createStyles } from "$lib/utils/props";
  import { getContext } from "svelte";
  import type { QDrawerProps } from "./props";
  import type { LayoutContext } from "../layout/QLayout.svelte";
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

  $: canHideOnClickOutside = (value === true && persistent === false) || overlay === true;

  $: belowBreakpoint =
    (behavior === "mobile") === true ||
    (behavior !== "desktop" && /** TODO: Get Layout width */ 1300 <= breakpoint!);

  $: widthStyle = ctx === undefined ? (isNaN(Number(width)) ? width : `${width}px`) : undefined;

  $: hideOnRouteChange = persistent !== true || overlay === true;

  export const show = (e?: CustomEvent<MouseEvent | KeyboardEvent>) => {
    if (value !== true) {
      value = true;
      e && e.stopPropagation();
    }
  };

  export const hide = () => {
    if (value === true && canHideOnClickOutside === true) {
      value = false;
    }
  };

  export const toggle = (e?: CustomEvent<MouseEvent | KeyboardEvent>) => {
    value = !value;
    e && e.stopPropagation();
  };

  $: if ($navigating && hideOnRouteChange) {
    hide();
  }

  let ctx = getContext<LayoutContext | undefined>("layout");

  function prepareZIndexClass(
    context: NonNullable<typeof $ctx>,
    overlayProp: typeof overlay,
    sideProp: typeof side
  ) {
    let drawer = sideProp === "left" ? context.drawerLeft : context.drawerRight;

    let pos: keyof typeof drawer.offset;
    for (pos of ["top", "bottom"] as const) {
      if (!drawer.offset[pos] && overlayProp) {
        drawer.overlay = true;
        return "above";
      }
    }
  }

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
    getBorderRadiusClasses(side, overlay, $ctx),
    $ctx && prepareZIndexClass($ctx, overlay, side),
    userClasses,
  ]);

  $: style = createStyles(
    {
      [side === "left" ? "--leftDrawerWidth" : "--rightDrawerWidth"]: widthStyle,
    },
    userStyles
  );

  function getBorderRadiusClasses(
    sideProp: typeof side,
    overlayProp: typeof overlay,
    context: typeof $ctx
  ) {
    let prefix = "border-radius" + (sideProp === "left" ? "__right" : "__left");

    const shouldHaveRadius = (pos: "top" | "bottom") => {
      // This isn't a layout
      if (!context) return undefined;

      let appbarEl = pos === "top" ? context["header"] : context["footer"];
      // There's a visible header/footer and the drawer doesn't have an offset top/bottom
      if (appbarEl && appbarEl.display && !context[drawerType].offset[pos] && !overlayProp)
        return undefined;

      return `${prefix}--${pos}`;
    };

    return createClasses([shouldHaveRadius("top"), shouldHaveRadius("bottom")]);
  }
</script>

<div use:clickOutside={hide} class={classes} {style}>
  <slot />
</div>
