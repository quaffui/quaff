<!--
@component
Navigation drawers provide ergonomic access to destinations in an app
-->

<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { on } from "svelte/events";
  import { innerWidth } from "svelte/reactivity/window";
  import { navigationCtx } from "$internal/navigationContext";
  import { navigating } from "$app/state";
  import { useSize } from "$composables/useSize";
  import {
    startDrawerCtx,
    endDrawerCtx,
    leftDrawerCtx,
    rightDrawerCtx,
  } from "../layout/QLayout.svelte";

  // #region:    --- Props
  let {
    value = $bindable(false),
    side = "start",
    width = 360,
    breakpoint = 1023,
    behavior = "default",
    bordered = false,
    overlay = false,
    persistent = false,
    noSwipe = false,
    swipeThreshold = "30%",
    children,
    ...props
  }: QDrawerProps = $props();
  // #endregion: --- Props
  import type { QDrawerProps } from "./props";

  navigationCtx.set("drawer");

  // #region:    --- Non-reactive variables
  const PEEK_THRESHOLD = 30; // How far the drawer peeks out when cursor is near the edge
  const TRANSITION = "top 0.3s, bottom 0.3s, transform 0.3s";

  let clickTimer: ReturnType<typeof setTimeout> | undefined;
  let removeWindowClickListener: (() => void) | undefined;
  let removePointerdownListener: (() => void) | undefined;
  let removePointermoveListener: (() => void) | undefined;
  let removePointerupListener: (() => void) | undefined;
  let removePointercancelListener: (() => void) | undefined;

  let isSwiping = false;
  let startX = 0;
  let dragOffset = 0;
  let swipeWidth = 0;
  let swipeSide: "left" | "right" = "left";
  // #endregion: --- Non-reactive variables

  // #region:    --- Reactive variables
  let drawerEl = $state<HTMLDivElement>();
  let swipeAreaEl = $state<HTMLDivElement>();
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const contexts = {
    start: { api: startDrawerCtx, context: startDrawerCtx.get() },
    end: { api: endDrawerCtx, context: endDrawerCtx.get() },
    left: { api: leftDrawerCtx, context: leftDrawerCtx.get() },
    right: { api: rightDrawerCtx, context: rightDrawerCtx.get() },
  };
  const drawerContext = $derived(contexts[side].context);

  const isBelowBreakpoint = $derived.by(() => {
    if (behavior === "mobile") {
      return true;
    }

    if (behavior === "desktop") {
      return false;
    }

    const currentWidth = innerWidth.current;
    return currentWidth ? currentWidth <= breakpoint : false;
  });

  const isModal = $derived(overlay || isBelowBreakpoint);
  const canHideOnClickOutside = $derived(value && !persistent);
  const hideOnRouteChange = $derived(!persistent || isModal);
  const canSwipe = $derived(!noSwipe && isBelowBreakpoint);

  const widthStyle = $derived(drawerContext ? `${width}px` : useSize(width).style);
  const style = $derived(`--q-drawer-width: ${widthStyle};${props.style ?? ""}`);
  // #endregion: --- Derived values

  // #region:    --- Lifecycle
  onMount(() => {
    setTimeout(() => {
      drawerEl?.style.setProperty("transition", TRANSITION);
    }, 100);

    return () => {
      clearClickListener();
      clearPointerdownListener();

      if (isSwiping) {
        removePointermoveListener?.();
        removePointerupListener?.();
        removePointercancelListener?.();

        resetBodyStyles();
      }
    };
  });
  // #endregion: --- Lifecycle

  // #region:    --- Effects
  $effect(() => {
    if (navigating.type && hideOnRouteChange) {
      hide();
    }
  });

  $effect(() => {
    clearClickListener();
    clearPointerdownListener();

    if (value) {
      clickTimer = setTimeout(() => {
        removeWindowClickListener = on(window, "click", tryClose);
        clickTimer = undefined;
      }, 150);

      untrack(() => {
        if (canSwipe && !persistent) {
          addPointerdownListener(drawerEl);
          swipeAreaEl?.style.setProperty("z-index", "-1");
        }
      });
    } else {
      if (canSwipe) {
        addPointerdownListener(swipeAreaEl);
        swipeAreaEl?.style.setProperty("z-index", "10");
      }
    }

    return () => {
      clearClickListener();
      clearPointerdownListener();
    };
  });

  $effect(() => {
    // Keep this side's context so cleanup resets it after a side change.
    const { api: contextApi, context } = contexts[side];

    if (!context) {
      return;
    }

    contextApi.updateEntries(context, { takesSpace: !!value && !isModal, width, ready: true });

    return () => {
      contextApi.updateEntries(context, { takesSpace: false, width: 0, ready: false });
    };
  });
  // #endregion: --- Effects

  // #region:    --- Methods
  /** Opens the drawer. */
  export const show = (e?: MouseEvent) => {
    if (!value) {
      value = true;
      e?.stopPropagation();
    }
  };

  /** Closes the drawer. */
  export const hide = () => {
    if (value) {
      value = false;
    }
  };

  /** Toggles the drawer. */
  export const toggle = (e?: MouseEvent) => {
    value = !value;
    e?.stopPropagation();
  };
  // #endregion: --- Methods

  // #region:    --- Functions
  function tryClose(e: MouseEvent) {
    const isTargetDrawer = e.target === drawerEl;
    const isTargetInsideDrawer = drawerEl?.contains(e.target as Node);

    if (canHideOnClickOutside && !isTargetDrawer && !isTargetInsideDrawer) {
      e.stopPropagation();
      hide();
    }
  }

  function clearClickListener() {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = undefined;
    }

    removeWindowClickListener?.();
    removeWindowClickListener = undefined;
  }

  function clearPointerdownListener() {
    removePointerdownListener?.();
    removePointerdownListener = undefined;
  }

  function addPointerdownListener(target?: HTMLElement) {
    if (target) {
      removePointerdownListener = on(target, "pointerdown", handlePointerDown);
    }
  }

  function handlePointerDown(e: PointerEvent) {
    if (
      noSwipe ||
      !isBelowBreakpoint ||
      !drawerEl ||
      !swipeAreaEl ||
      (e.pointerType === "mouse" && e.buttons !== 1) ||
      (value && persistent)
    ) {
      return;
    }

    const isRtl = getComputedStyle(drawerEl).direction === "rtl";
    swipeSide =
      side === "left" || side === "right" ? side : (side === "start") !== isRtl ? "left" : "right";
    const drawerRect = drawerEl.getBoundingClientRect();
    const y = e.clientY;

    if (y < drawerRect.top || y > drawerRect.bottom) {
      // Ignore pointer events outside the vertical bounds of the drawer
      return;
    }

    let swipeAllowed;
    startX = e.clientX;
    swipeWidth = drawerRect.width;

    if (!value) {
      swipeAllowed = true;

      const baseWidth = swipeSide === "left" ? -swipeWidth : swipeWidth;

      dragOffset = baseWidth + (swipeSide === "left" ? PEEK_THRESHOLD : -PEEK_THRESHOLD);

      drawerEl.style.transform = `translateX(${dragOffset}px)`;
    } else {
      // If drawer is open, allow swipe from anywhere
      swipeAllowed = true;

      // No initial dragOffset change or transform needed as it's already open.
      // dragOffset will be calculated fresh in handlePointerMove.
    }

    if (!swipeAllowed) {
      return;
    }

    isSwiping = true;

    e.stopPropagation();
    e.preventDefault();

    document.body.style.setProperty("cursor", "grabbing");
    document.body.style.setProperty("user-select", "none"); // Disable text selection

    drawerEl.style.transition = "none"; // Disable CSS transitions for smooth dragging
    drawerEl.style.touchAction = "none"; // Disable touch actions

    swipeAreaEl?.style.setProperty("width", "100vw"); // Expand swipe area to full width

    removePointermoveListener = on(e.target as HTMLElement, "pointermove", handlePointerMove);
    removePointerupListener = on(e.target as HTMLElement, "pointerup", handlePointerUp, {
      passive: true,
    });
    removePointercancelListener = on(e.target as HTMLElement, "pointercancel", handlePointerUp, {
      passive: true,
    });
  }

  function handlePointerMove(e: PointerEvent) {
    if (noSwipe || !drawerEl || !swipeAreaEl || !isSwiping) {
      return;
    }

    e.preventDefault();

    let deltaX = e.clientX - startX;

    let newPosition: number;
    // basePosition is the starting translation before applying the current deltaX.
    let basePosition: number;

    if (swipeSide === "left") {
      // For a left-side drawer, dragOffset is between -width (fully closed) and 0 (fully open).
      basePosition = value ? 0 : PEEK_THRESHOLD - swipeWidth;
      newPosition = basePosition + deltaX;
      // Clamp newPosition to be within [-width, 0]
      dragOffset = Math.max(-swipeWidth, Math.min(0, newPosition));
    } else {
      // For a right-side drawer, dragOffset is between width (fully closed) and 0 (fully open).
      basePosition = value ? 0 : swipeWidth - PEEK_THRESHOLD;
      newPosition = basePosition + deltaX;
      // Clamp newPosition to be within [0, width]
      dragOffset = Math.max(0, Math.min(swipeWidth, newPosition));
    }

    drawerEl.style.transform = `translateX(${dragOffset}px)`;
  }

  function handlePointerUp() {
    if (noSwipe || !drawerEl || !swipeAreaEl || !isSwiping) {
      return;
    }

    isSwiping = false;

    resetBodyStyles();

    drawerEl.style.transition = TRANSITION;
    drawerEl.style.transform = "";
    drawerEl.style.touchAction = ""; // Re-enable touch actions

    swipeAreaEl?.style.removeProperty("width"); // Reset swipe area width

    const thresholdWidth = (swipeWidth * parseInt(swipeThreshold.replace("%", ""))) / 100;
    const realThreshold = value ? swipeWidth - thresholdWidth : thresholdWidth;

    const swiped = swipeWidth + (swipeSide === "left" ? dragOffset : -dragOffset);

    if (swiped >= realThreshold) {
      if (!value) {
        show(); // Snap open
      }
    } else {
      if (value) {
        hide(); // Snap closed
      }
    }

    dragOffset = 0;

    removePointercancelListener?.();
    removePointermoveListener?.();
    removePointerupListener?.();
  }

  function resetBodyStyles() {
    document.body.style.removeProperty("cursor");
    document.body.style.removeProperty("user-select");
  }
  // #endregion: --- Functions

  Q.classes("q-drawer", {
    bemClasses: {
      [side]: true,
      active: value,
      overlay: isModal,
      bordered,
    },
    classes: [props.class],
  });
</script>

{#if isModal}
  <button
    type="button"
    tabindex="-1"
    aria-label={persistent ? undefined : "Close drawer"}
    aria-hidden={persistent || undefined}
    disabled={persistent}
    class="q-drawer__scrim"
    class:q-drawer__scrim--active={value}
    onclick={persistent ? undefined : hide}
  ></button>
{/if}

<div
  bind:this={drawerEl}
  {...props}
  class="q-drawer"
  {style}
  inert={!value || props.inert}
  data-quaff
>
  {@render children?.()}
</div>

{#if canSwipe}
  <div
    bind:this={swipeAreaEl}
    role="presentation"
    class="q-drawer__swipearea q-drawer__swipearea--{side}"
    onpointerdown={handlePointerDown}
  ></div>
{/if}
