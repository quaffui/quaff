<!--
@component
Railbars provide navigation in collapsed and expanded forms. Bind `expanded` to control expansion,
and use `modal` to expand above the page instead of resizing its content.
-->

<script module lang="ts">
  import { QContext } from "$utils/context";

  interface RailbarContext {
    readonly expanded: boolean;
  }

  export const railbarNavigationCtx = QContext<RailbarContext>("QRailbarNavigation");
</script>

<script lang="ts">
  import { tick } from "svelte";
  import { on } from "svelte/events";
  import { navigationCtx } from "$internal/navigationContext";

  import { useColor } from "$composables";
  import type { QEvent } from "$utils";
  import { closeNestedOverlays } from "$utils/dom";
  import {
    startRailbarCtx,
    endRailbarCtx,
    leftRailbarCtx,
    rightRailbarCtx,
  } from "../layout/QLayout.svelte";
  import type { QRailbarProps } from "./props";

  navigationCtx.set("rail");

  // #region:    --- Props
  let {
    activeColor = "secondary-container",
    expanded = $bindable(false),
    expandedWidth = 256,
    modal = false,
    width = 80,
    side = "start",
    bordered = false,
    children,
    onclick,
    onpointerdown,
    oncancel,
    onclose,
    onfocus,
    onblur,
    onscroll,
    onscrollend,
    ...props
  }: QRailbarProps = $props();
  // #endregion: --- Props

  railbarNavigationCtx.set({ expanded });

  let railbarEl = $state<HTMLDialogElement>();
  let modalOpen = $state(false);
  let resizing = $state(false);
  let contentWidth = $state<number>();
  let collapsedSize: { configured: number; measured: number } | undefined;
  let hasBackdropPointerDown = false;
  let previousFocus: Element | null = null;
  const contexts = {
    start: { api: startRailbarCtx, context: startRailbarCtx.get() },
    end: { api: endRailbarCtx, context: endRailbarCtx.get() },
    left: { api: leftRailbarCtx, context: leftRailbarCtx.get() },
    right: { api: rightRailbarCtx, context: rightRailbarCtx.get() },
  };

  // #region:    --- Derived values
  const isModal = $derived((expanded && modal) || modalOpen);
  const parsedActiveColor = $derived(
    activeColor === "secondary-container" ? undefined : useColor(activeColor)
  );

  const style = $derived(
    `--q-railbar-width: ${expanded ? expandedWidth : width}px;${props.style ?? ""}`
  );
  const navigationProps = $derived(
    Object.fromEntries(
      Object.entries(props).filter(
        ([key]) => key.startsWith("aria-") || key === "role" || key === "tabindex"
      )
    )
  );
  const containerProps = $derived.by(() => {
    const attributes = { ...props };

    for (const key of Object.keys(navigationProps)) {
      Reflect.deleteProperty(attributes, key);
    }

    return attributes;
  });
  // #endregion: --- Derived values

  $effect(() => {
    const element = railbarEl;

    if (!element) {
      return;
    }

    if (expanded && modal) {
      if (!element.matches(":modal")) {
        previousFocus = document.activeElement;
        // Clearing the standard open state avoids a close event just for modal entry.
        element.open = false;
        element.showModal();
        modalOpen = true;

        if (previousFocus instanceof HTMLElement && element.contains(previousFocus)) {
          previousFocus.focus({ preventScroll: true });
        }
      }

      return;
    }

    let canceled = false;

    if (element.matches(":modal")) {
      closeNestedOverlays(element);
    }

    async function finishCollapse(element: HTMLDialogElement) {
      await tick();
      // Consumer animations must not keep the page blocked after the rail has collapsed.
      const transitions = getWidthTransitions(element);
      await Promise.allSettled(transitions.map((animation) => animation.finished));

      if (canceled || !element.matches(":modal")) {
        return;
      }

      const focusedElement = document.activeElement;
      element.close();
      element.open = true;
      modalOpen = false;

      const focusTarget = expanded ? focusedElement : previousFocus;

      if (focusTarget instanceof HTMLElement && focusTarget.isConnected) {
        focusTarget.focus({ preventScroll: true });
      }
    }

    void finishCollapse(element);

    return () => {
      canceled = true;
    };
  });

  $effect.pre(() => {
    const element = railbarEl;
    return () => element?.close();
  });

  $effect(() => {
    // Keep this side's context so cleanup resets it after a side change.
    const { api: contextApi, context } = contexts[side];
    const element = railbarEl;
    const isCollapsed = !expanded;
    const collapsedConfiguredWidth = width;
    const configuredWidth = isCollapsed ? width : expandedWidth;
    // Modal rails use the viewport even when their QLayout is nested.
    const inTopLayer = isModal;

    if (!element) {
      return;
    }

    const containingBlock = inTopLayer ? null : element.offsetParent;

    const updateLayout = () => {
      const style = getComputedStyle(element);
      const availableWidth = containingBlock?.clientWidth ?? window.innerWidth;
      const inlineSpacing =
        parseFloat(style.paddingLeft) +
        parseFloat(style.paddingRight) +
        parseFloat(style.borderLeftWidth) +
        parseFloat(style.borderRightWidth);
      const isResizing = getWidthTransitions(element).length > 0;
      // Lay out children at their destination width while the scroll viewport reveals them.
      contentWidth = isResizing
        ? Math.max(0, Math.min(configuredWidth, availableWidth) - inlineSpacing)
        : undefined;

      if (!context) {
        return;
      }

      let measuredWidth = element.offsetWidth;

      if (!measuredWidth && style.display !== "none") {
        measuredWidth = style.width.endsWith("px") ? parseFloat(style.width) : configuredWidth;
      }

      if (isCollapsed && !inTopLayer && !isResizing) {
        collapsedSize = { configured: collapsedConfiguredWidth, measured: measuredWidth };
      }

      let layoutWidth = measuredWidth;

      if (inTopLayer && measuredWidth > 0) {
        // Keep the actual collapsed space, including CSS constraints, until the modal closes.
        layoutWidth =
          collapsedSize?.configured === collapsedConfiguredWidth
            ? collapsedSize.measured
            : collapsedConfiguredWidth;
      }

      contextApi.updateEntries(context, {
        width: layoutWidth,
        takesSpace: measuredWidth > 0,
        ready: true,
      });
    };
    const observer = new ResizeObserver(updateLayout);
    updateLayout();
    observer.observe(element);

    if (containingBlock) {
      observer.observe(containingBlock);
    }

    const stopResize = on(window, "resize", updateLayout);

    return () => {
      observer.disconnect();
      stopResize();

      if (context) {
        contextApi.updateEntries(context, { width: 0, takesSpace: false, ready: false });
      }
    };
  });

  /** Expands the railbar. */
  export function expand() {
    expanded = true;
  }

  /** Collapses the railbar. */
  export function collapse() {
    expanded = false;
  }

  /** Toggles the expanded state. */
  export function toggle() {
    expanded = !expanded;
  }

  function isBackdrop(event: MouseEvent) {
    if (event.target !== railbarEl || !railbarEl?.matches(":modal")) {
      return false;
    }

    const { left, right, top, bottom } = railbarEl.getBoundingClientRect();
    return (
      event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom
    );
  }

  function handlePointerDown(event: QEvent<PointerEvent, HTMLDialogElement>) {
    onpointerdown?.(event);
    hasBackdropPointerDown = !event.defaultPrevented && isBackdrop(event);
  }

  function handleClick(event: QEvent<MouseEvent, HTMLDialogElement>) {
    onclick?.(event);

    if (!event.defaultPrevented && hasBackdropPointerDown && isBackdrop(event)) {
      collapse();
    }

    hasBackdropPointerDown = false;
  }

  function handleCancel(event: QEvent<Event, HTMLDialogElement>) {
    oncancel?.(event);

    if (!event.defaultPrevented) {
      event.preventDefault();
      collapse();
    }
  }

  function handleClose(event: QEvent<Event, HTMLDialogElement>) {
    if (event.target !== railbarEl || !railbarEl) {
      return;
    }

    // A queued close must not reset a rail that has already reopened.
    if (!railbarEl.open) {
      expanded = false;
      modalOpen = false;
      railbarEl.open = true;
    }

    onclose?.(event);
  }

  function handleTransition(event: QEvent<TransitionEvent, HTMLDialogElement>) {
    if (event.target === railbarEl && event.propertyName === "width") {
      resizing = event.type === "transitionrun";

      if (!resizing && !getWidthTransitions(railbarEl).length) {
        // Return to the actual viewport width, including consumer CSS constraints.
        contentWidth = undefined;
      }
    }

    if (event.type === "transitionrun") {
      props.ontransitionrun?.(event);
    } else if (event.type === "transitionend") {
      props.ontransitionend?.(event);
    } else {
      props.ontransitioncancel?.(event);
    }
  }

  function getWidthTransitions(element: HTMLDialogElement) {
    return element
      .getAnimations()
      .filter(
        (animation) =>
          animation instanceof CSSTransition && animation.transitionProperty === "width"
      );
  }

  Q.classes("q-railbar", {
    bemClasses: {
      [side]: true,
      expanded,
      resizing,
      collapsed: !expanded,
      bordered,
    },
    classes: [props.class],
  });
</script>

<dialog
  bind:this={railbarEl}
  {...containerProps}
  {...isModal ? navigationProps : {}}
  open
  class="q-railbar"
  role={isModal ? "dialog" : "presentation"}
  aria-modal={isModal || undefined}
  tabindex={undefined}
  {style}
  style:--q-nav-item-active-indicator-color={parsedActiveColor}
  onclick={handleClick}
  onpointerdown={handlePointerDown}
  oncancel={handleCancel}
  onclose={handleClose}
  ontransitionrun={handleTransition}
  ontransitionend={handleTransition}
  ontransitioncancel={handleTransition}
  data-quaff-overlay={isModal || undefined}
  data-quaff
>
  <nav
    {...isModal ? {} : navigationProps}
    class="q-railbar__content"
    {onfocus}
    {onblur}
    {onscroll}
    {onscrollend}
  >
    <div
      class="q-railbar__items"
      style:--q-railbar-content-width={contentWidth === undefined ? undefined : `${contentWidth}px`}
    >
      {@render children?.()}
    </div>
  </nav>
  <div class="q-railbar__overlay-root" data-quaff-overlay-root></div>
</dialog>
