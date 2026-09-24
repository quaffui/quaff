<!--
@component
QMenu displays anchored popup content. It handles positioning, outside-click dismissal, Escape dismissal, and native dialog layering.
-->

<script lang="ts">
  import { onMount, tick, untrack } from "svelte";
  import { on } from "svelte/events";
  import { innerHeight, innerWidth } from "svelte/reactivity/window";
  import { browser } from "$app/environment";
  import { quaffConfig } from "$internal/quaffConfig";
  import { menuCtx } from "$internal/menuContext";
  import { doesOverlayUsePopover, getOverlayPortalTarget, portal, type QEvent } from "$utils";
  import type { QMenuAnchor, QMenuProps } from "./props";

  // #region:    --- Props
  let {
    value = $bindable(false),
    target,
    offset = {},
    flip = false,
    anchor = "bottom left",
    self = "top left",
    fit = false,
    expressive,
    persistent = false,
    autoClose = true,
    children,
    class: userClass,
    onclick,
    ontoggle,
    ...props
  }: QMenuProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let helperEl = $state<HTMLSpanElement>();
  let menuEl = $state<HTMLDivElement>();
  let anchorEl = $state<HTMLElement | null>(null);
  let menuTop = $state(0);
  let menuLeft = $state(0);
  let menuWidth = $state<string | undefined>();
  let menuMaxWidth = $state<string | undefined>();
  let menuPosition = $state<"fixed" | "absolute">("fixed");
  let wasMenuOpen = false;
  let positionFrame: number | undefined;
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const [anchorX, anchorY] = $derived(parseAnchor(anchor));
  const [selfX, selfY] = $derived(parseAnchor(self));
  const isExpressive = $derived(expressive ?? quaffConfig.expressive);
  const portalTarget = $derived(browser ? getOverlayPortalTarget(anchorEl) : undefined);
  // #endregion: --- Derived values

  // #region:    --- Context
  menuCtx.set(true);
  // #endregion: --- Context

  // #region:    --- Effects
  $effect(() => {
    if (!browser || !helperEl) {
      return;
    }

    if (target) {
      anchorEl = target;
      return;
    }

    anchorEl = findParentQuaffElement(helperEl);
  });

  $effect(() => {
    if (!browser) {
      return;
    }

    if (value && !wasMenuOpen) {
      wasMenuOpen = true;
      untrack(openMenu);
      return;
    }

    if (!value && wasMenuOpen) {
      wasMenuOpen = false;
      untrack(closeMenu);
    }
  });

  $effect(() => {
    if (!browser || !value || !anchorEl || !menuEl) {
      return;
    }

    const viewportWidth = innerWidth.current;
    const viewportHeight = innerHeight.current;
    const syncCurrentPosition = () => schedulePositionSync(viewportWidth, viewportHeight);

    syncPosition(viewportWidth, viewportHeight);
    const removeWindowScrollListener = on(window, "scroll", syncCurrentPosition, { capture: true });

    return () => {
      removeWindowScrollListener();
      cancelPositionSync();
    };
  });

  $effect(() => {
    if (!browser || !value) {
      return;
    }

    const removeDocumentPointerdownListener = on(
      document,
      "pointerdown",
      handleDocumentPointerdown,
      {
        capture: true,
      }
    );
    const removeDocumentKeydownListener = on(document, "keydown", handleDocumentKeydown);

    return () => {
      removeDocumentPointerdownListener();
      removeDocumentKeydownListener();
    };
  });
  // #endregion: --- Effects

  // #region:    --- Lifecycle
  onMount(() => hidePopover);
  // #endregion: --- Lifecycle

  // #region:    --- Methods
  /** Opens the menu. */
  export function show() {
    value = true;
  }

  /** Closes the menu. */
  export function hide() {
    value = false;
  }

  /** Toggles the menu open state. */
  export function toggle() {
    value = !value;
  }
  // #endregion: --- Methods

  // #region:    --- Functions
  function findParentQuaffElement(el: HTMLElement) {
    let parent = el.parentElement;

    while (parent) {
      if (parent.hasAttribute("data-quaff")) {
        return parent;
      }
      parent = parent.parentElement;
    }

    return el.parentElement;
  }

  function parseAnchor(anchorValue: QMenuAnchor): [number, number] {
    const [vertical, horizontal] = anchorValue.split(" ") as [string, string];
    const verticalMap: Record<string, number> = {
      top: 0,
      center: 0.5,
      bottom: 1,
    };
    const horizontalMap: Record<string, number> = {
      left: 0,
      middle: 0.5,
      right: 1,
    };

    return [horizontalMap[horizontal] ?? 0, verticalMap[vertical] ?? 0];
  }

  async function openMenu() {
    await tick();

    if (menuEl && doesOverlayUsePopover(anchorEl) && "showPopover" in menuEl) {
      menuEl.showPopover();
      await tick();
    }

    syncPosition();
    schedulePositionSync();
  }

  function closeMenu() {
    hidePopover();
  }

  function hidePopover() {
    if (!menuEl || !("hidePopover" in menuEl)) {
      return;
    }

    try {
      menuEl.hidePopover();
    } catch {
      /* already closed */
    }
  }

  function syncPosition(viewportWidth = innerWidth.current, viewportHeight = innerHeight.current) {
    if (
      !browser ||
      !anchorEl ||
      !menuEl ||
      viewportWidth === undefined ||
      viewportHeight === undefined
    ) {
      return;
    }

    const rect = anchorEl.getBoundingClientRect();
    const dialog = anchorEl.closest("dialog");
    const shouldUsePopover = doesOverlayUsePopover(anchorEl);
    const dialogRect = dialog?.open && !shouldUsePopover ? dialog.getBoundingClientRect() : null;
    const margin = 8;
    const maxViewportWidth = viewportWidth - margin * 2;
    const baseTop = rect.top + rect.height * anchorY;
    const baseLeft = rect.left + rect.width * anchorX;
    const measured = menuEl.getBoundingClientRect();
    const measuredWidth = fit ? Math.min(rect.width, maxViewportWidth) : measured.width;

    let top = baseTop - measured.height * selfY + (offset.y ?? 0);
    const left = baseLeft - measuredWidth * selfX + (offset.x ?? 0);
    const canFlip = flip && anchorY !== 0.5 && selfY === 1 - anchorY;
    const isClipped = top < margin || top + measured.height > viewportHeight - margin;

    if (canFlip && isClipped) {
      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;
      const hasMoreRoom = anchorY === 1 ? spaceAbove > spaceBelow : spaceBelow > spaceAbove;

      if (hasMoreRoom) {
        top = rect.top + rect.height * selfY - measured.height * anchorY - (offset.y ?? 0);
      }
    }

    menuWidth = fit ? `${rect.width}px` : undefined;
    menuMaxWidth = fit ? `${maxViewportWidth}px` : undefined;

    if (dialogRect) {
      menuPosition = "absolute";
      menuTop = top - dialogRect.top;
      menuLeft = left - dialogRect.left;
      return;
    }

    menuPosition = "fixed";
    menuTop = Math.max(margin, Math.min(top, viewportHeight - measured.height - margin));
    menuLeft = Math.max(margin, Math.min(left, viewportWidth - measuredWidth - margin));
  }

  function schedulePositionSync(
    viewportWidth = innerWidth.current,
    viewportHeight = innerHeight.current
  ) {
    if (positionFrame !== undefined) {
      return;
    }

    positionFrame = requestAnimationFrame(() => {
      positionFrame = undefined;
      syncPosition(viewportWidth, viewportHeight);
    });
  }

  function cancelPositionSync() {
    if (positionFrame === undefined) {
      return;
    }

    cancelAnimationFrame(positionFrame);
    positionFrame = undefined;
  }

  function handleDocumentPointerdown(event: PointerEvent) {
    if (!value || persistent) {
      return;
    }

    const targetNode = event.target as Node;
    if (anchorEl?.contains(targetNode) || menuEl?.contains(targetNode)) {
      return;
    }

    hide();
  }

  function handleDocumentKeydown(event: KeyboardEvent) {
    const target = event.target;

    if (
      !value ||
      event.defaultPrevented ||
      event.isComposing ||
      event.keyCode === 229 ||
      event.key !== "Escape"
    ) {
      return;
    }

    if (
      target instanceof Element &&
      target.closest("dialog:modal") !== anchorEl?.closest("dialog:modal")
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    hide();
  }

  function handlePopoverToggle(event: QEvent<ToggleEvent, HTMLDivElement>) {
    ontoggle?.(event);

    if (
      event.currentTarget === menuEl &&
      event.newState === "closed" &&
      !menuEl.matches(":popover-open")
    ) {
      hide();
    }
  }

  function handleMenuClick(event: QEvent<MouseEvent, HTMLDivElement>) {
    onclick?.(event);

    if (!event.defaultPrevented && autoClose) {
      hide();
    }
  }
  // #endregion: --- Functions

  Q.classes("q-menu", {
    bemClasses: {
      expressive: isExpressive,
    },
    classes: [userClass],
  });
</script>

<span bind:this={helperEl} class="q-menu__helper" aria-hidden="true"></span>

{#if value}
  <div
    bind:this={menuEl}
    {@attach portal(portalTarget)}
    popover={doesOverlayUsePopover(anchorEl) ? "manual" : undefined}
    data-quaff
    data-quaff-overlay
    data-quaff-menu
    role="menu"
    tabindex="-1"
    {...props}
    class="q-menu"
    style:position={menuPosition}
    style:top="{menuTop}px"
    style:left="{menuLeft}px"
    style:width={menuWidth}
    style:max-width={menuMaxWidth}
    onclick={handleMenuClick}
    ontoggle={handlePopoverToggle}
  >
    {@render children?.()}
  </div>
{/if}
