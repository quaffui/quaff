<script lang="ts">
  import { navigating } from "$app/stores";
  import { createClasses, createStyles } from "$lib/utils/props";
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import { type QDrawerProps } from "./props";
  import { type DrawerContext } from "../layout/QLayout.svelte";
  import { clickOutside } from "$lib/helpers";

  export let value: QDrawerProps["value"] = false,
    side: QDrawerProps["side"] = "left",
    width: QDrawerProps["width"] = 300,
    mini: QDrawerProps["mini"] = false,
    miniToOverlay: QDrawerProps["miniToOverlay"] = false,
    miniWidth: QDrawerProps["miniWidth"] = 57,
    noMiniAnimation: QDrawerProps["noMiniAnimation"] = false,
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
    (behavior !== "desktop" && /** TODO: Get Layout width */ 1300 <= breakpoint);

  $: isMini = mini === true && belowBreakpoint !== true;

  $: size = ctx === undefined ? (isMini === true ? miniWidth : width).toString() : undefined;
  $: widthStyle = size && (isNaN(Number(size)) ? size : `${size}px`);

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

  $: ctx = getContext<DrawerContext | undefined>(side === "left" ? "drawerLeft" : "drawerRight");

  $: classes = createClasses([
    "q-drawer",
    mini ? "q-pa-sm" : "q-pa-md",
    side,
    value && "active",
    mini && "mini",
    overlay && "overlay",
    bordered && "bordered",
    ctx?.offset?.top && "offset-top",
    ctx?.offset?.bottom && "offset-bottom",
    ctx?.fixed && "fixed",
    getBorderRadiusClasses(side, ctx),
    userClasses,
  ]);

  $: style = createStyles({
    [side === "left" ? "--leftDrawerWidth" : "--rightDrawerWidth"]: widthStyle,
  });

  function getBorderRadiusClasses(sideProp: typeof side, context: typeof ctx) {
    let prefix = "border-radius" + (sideProp === "left" ? "__right" : "__left");
    return createClasses([
      context?.offset?.top !== false ? prefix + "--top" : undefined,
      context?.offset?.bottom !== false ? prefix + "--bottom" : undefined,
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

<style lang="scss">
  .q-drawer {
    height: 100%;
    position: absolute;
    top: 0px;
    right: auto;
    bottom: 0px;
    left: auto;
    transition: all var(--speed3), 0s background-color;
    z-index: 1000;
    &.fixed {
      position: fixed;
    }
    &.left {
      left: 0px;
      transform: translate(-100%);
      &.bordered {
        border-right: 0.0625rem solid var(--outline);
      }
    }
    &.right {
      right: 0px;
      transform: translate(100%);
    }
    &.active {
      transform: translate(0);
    }
    &.offset- {
      &top {
        top: 64px;
        height: calc(100% - 64px);
        &.offset-bottom {
          height: calc(100% - 64px - 80px);
        }
      }
      &bottom {
        bottom: 80px;
        height: calc(100% - 80px);
      }
    }
    &.border-radius {
      &__left {
        &--top {
          border-top-left-radius: 16px;
        }
        &--bottom {
          border-bottom-left-radius: 16px;
        }
      }
      &__right {
        &--top {
          border-top-right-radius: 16px;
        }
        &--bottom {
          border-bottom-right-radius: 16px;
        }
      }
    }
  }
</style>
