<script lang="ts">
  import { navigating } from "$app/stores";
  import { createClasses, createStyles } from "$lib/utils/props";
  import { getContext } from "svelte";
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

  $: size = isMini === true ? miniWidth : width;

  $: hideOnRouteChange = persistent !== true || overlay === true;

  $: if (value === true && persistent !== true && overlay !== true) {
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
    side,
    value && "active",
    ctx?.offset?.top && "offset-top",
    userClasses,
  ]);

  $: style = createStyles(
    {
      transition: "all var(--speed3), 0s background-color",
      width: `${size}px`,
      left: side === "left" ? "0px" : undefined,
      right: side === "right" ? "0px" : undefined,
      top: ctx?.offset?.top === true ? "64px" : "0px",
      bottom: ctx?.offset?.bottom === true ? "64px" : "0px",
      position: ctx?.fixed === true ? "fixed" : "absolute",
      transform:
        value === true ? "translate(0)" : side === "left" ? "translate(-100%)" : "translate(100%)",
    },
    userStyles
  );
</script>

{#if overlay === true}
  <dialog class={classes} {style}>
    <slot />
  </dialog>
{:else}
  <div
    use:clickOutside={() => (canHideOnClickOutside === true ? hide() : null)}
    class={classes}
    {style}
  >
    <slot />
  </div>
{/if}
