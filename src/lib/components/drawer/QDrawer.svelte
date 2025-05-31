<script lang="ts">
  import { getContext, onMount, untrack } from "svelte";
  import { on } from "svelte/events";
  import { navigating } from "$app/state";
  import { useSize } from "$composables";
  import { QContext } from "$lib/classes/QContext.svelte";
  import { QLayoutCtxName } from "$utils";
  import type { QLayoutProps } from "$components/layout/props";
  import type { DrawerContext } from "../layout/QLayout.svelte";
  import type { QDrawerProps } from "./props";

  let {
    value = $bindable(false),
    side = "left",
    width = 300,
    bordered = false,
    overlay = false,
    persistent = false,
    noSwipe = false,
    swipeThreshold = "30%",
    children,
    ...props
  }: QDrawerProps = $props();

  const PEEK_THRESHOLD = 30; // How far the drawer peeks out when cursor is near the edge
  const TRANSITION = "top 0.3s, bottom 0.3s, transform 0.3s";

  let unlistenClick: () => void;
  let unlistenPointerdown: () => void;
  let unlistenPointermove: () => void;
  let unlistenPointerup: () => void;
  let unlistenPointercancel: () => void;

  let drawerEl = $state<HTMLDivElement>();
  let swipeAreaEl = $state<HTMLDivElement>();

  let isSwiping = $state(false);
  let startX = $state(0);
  let dragOffset = $state(0);

  const drawerContext = QContext.get<DrawerContext>(QLayoutCtxName.drawer[side]);
  const layoutView = getContext<{ value: NonNullable<QLayoutProps["view"]> }>(QLayoutCtxName.view);

  const canHideOnClickOutside = $derived((value && !persistent) || overlay);

  const hideOnRouteChange = $derived(!persistent || overlay);

  const offsetTop = $derived.by(() => {
    const charPos = side === "left" ? 0 : 2;
    return layoutView?.value.charAt(charPos) === "h";
  });
  const offsetBottom = $derived.by(() => {
    const charPos = side === "left" ? 8 : 10;
    return layoutView?.value.charAt(charPos) === "f";
  });

  export const show = (e?: MouseEvent) => {
    if (!value) {
      value = true;
      e?.stopPropagation();
    }
  };

  export const hide = () => {
    if (value) {
      value = false;
    }
  };

  export const toggle = (e?: MouseEvent) => {
    value = !value;
    e?.stopPropagation();
  };

  onMount(() => {
    setTimeout(() => {
      drawerEl?.style.setProperty("transition", TRANSITION);
    }, 100);

    return () => {
      unlistenClick?.();
      unlistenPointerdown?.();

      if (isSwiping) {
        unlistenPointermove?.();
        unlistenPointerup?.();
        unlistenPointercancel?.();

        resetBodyStyles();
      }

      drawerContext?.updateEntries({
        width: 0,
        takesSpace: false,
        ready: false,
      });
    };
  });

  $effect(() => {
    if (navigating.type && hideOnRouteChange) {
      hide();
    }
  });

  $effect(() => {
    if (value) {
      setTimeout(() => {
        unlistenClick = on(window, "click", tryClose);
      }, 150);

      untrack(() => {
        if (!noSwipe && !persistent) {
          unlistenPointerdown = on(drawerEl!, "pointerdown", handlePointerDown);
          swipeAreaEl?.style.setProperty("z-index", "-1");
        }
      });
    } else {
      unlistenClick?.();

      if (!noSwipe) {
        unlistenPointerdown = on(swipeAreaEl!, "pointerdown", handlePointerDown);
        swipeAreaEl?.style.setProperty("z-index", "10");
      }
    }
  });

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    [value, overlay, width];

    untrack(() =>
      drawerContext?.updateEntries({
        takesSpace: !!value && !overlay,
        width,
        ready: true,
      })
    );
  });

  Q.classes("q-drawer", {
    bemClasses: {
      [side]: true,
      active: value,
      overlay,
      bordered,
      "offset-top": offsetTop,
      "offset-bottom": offsetBottom,
    },
    classes: [props.class],
  });

  const widthStyle = $derived(!drawerContext ? useSize(width).style : null);

  const drawerWidthStyle = $derived(
    widthStyle === null ? "" : `--${side}-drawer-width: ${widthStyle};`
  );

  const style = $derived(`${drawerWidthStyle}${props.style ?? ""}`);

  function tryClose(e: MouseEvent) {
    const isTargetDrawer = e.target === drawerEl;
    const isTargetInsideDrawer = drawerEl?.contains(e.target as Node);

    if (canHideOnClickOutside && !isTargetDrawer && !isTargetInsideDrawer) {
      e.stopPropagation();
      hide();
    }
  }

  function handlePointerDown(e: PointerEvent) {
    if (
      noSwipe ||
      !drawerEl ||
      !swipeAreaEl ||
      (e.pointerType === "mouse" && e.buttons !== 1) ||
      (value && persistent)
    ) {
      return;
    }

    const drawerRect = drawerEl.getBoundingClientRect();
    const y = e.clientY;

    if (y < drawerRect.top || y > drawerRect.bottom) {
      // Ignore pointer events outside the vertical bounds of the drawer
      return;
    }

    let swipeAllowed = false;
    startX = e.clientX;

    if (!value) {
      swipeAllowed = true;

      const baseWidth = side === "left" ? -width : width;

      dragOffset = baseWidth + (side === "left" ? PEEK_THRESHOLD : -PEEK_THRESHOLD);

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

    unlistenPointermove = on(e.target as HTMLElement, "pointermove", handlePointerMove);
    unlistenPointerup = on(e.target as HTMLElement, "pointerup", handlePointerUp, {
      passive: true,
    });
    unlistenPointercancel = on(e.target as HTMLElement, "pointercancel", handlePointerUp, {
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

    if (side === "left") {
      // For a left-side drawer, dragOffset is between -width (fully closed) and 0 (fully open).
      basePosition = value ? 0 : PEEK_THRESHOLD - width;
      newPosition = basePosition + deltaX;
      // Clamp newPosition to be within [-width, 0]
      dragOffset = Math.max(-width, Math.min(0, newPosition));
    } else {
      // For a right-side drawer, dragOffset is between width (fully closed) and 0 (fully open).
      basePosition = value ? 0 : width - PEEK_THRESHOLD;
      newPosition = basePosition + deltaX;
      // Clamp newPosition to be within [0, width]
      dragOffset = Math.max(0, Math.min(width, newPosition));
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

    const thresholdWidth = (width * parseInt(swipeThreshold.replace("%", ""))) / 100;
    const realThreshold = value ? width - thresholdWidth : thresholdWidth;

    const swiped = width + (side === "left" ? dragOffset : -dragOffset);

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

    unlistenPointercancel?.();
    unlistenPointermove?.();
    unlistenPointerup?.();
  }

  function resetBodyStyles() {
    document.body.style.removeProperty("cursor");
    document.body.style.removeProperty("user-select");
  }
</script>

<div bind:this={drawerEl} {...props} class="q-drawer" {style} data-quaff>
  {@render children?.()}
</div>

{#if !noSwipe}
  <div
    bind:this={swipeAreaEl}
    class="q-drawer__swipearea q-drawer__swipearea--{side}"
    onpointerdown={handlePointerDown}
  ></div>
{/if}
