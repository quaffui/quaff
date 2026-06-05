<script lang="ts">
  import { onMount, tick, untrack } from "svelte";
  import { on } from "svelte/events";
  import { browser } from "$app/environment";
  import { doesOverlayUsePopover, getOverlayPortalTarget, usePortal } from "$utils";
  import type { QMenuAnchor, QMenuProps } from "./props";

  // #region:    --- Props
  let {
    value = $bindable(false),
    target,
    anchor = "bottom left",
    self = "top left",
    fit = false,
    persistent = false,
    autoClose = true,
    children,
    class: userClass,
    ...props
  }: QMenuProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let helperEl = $state<HTMLDivElement>();
  let menuEl = $state<HTMLDivElement>();
  let anchorEl = $state<HTMLElement | null>(null);
  let menuTop = $state(0);
  let menuLeft = $state(0);
  let menuWidth = $state<string | undefined>();
  let menuMaxWidth = $state<string | undefined>();
  let menuPosition = $state<"fixed" | "absolute">("fixed");
  let wasMenuOpen = false;
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const [anchorX, anchorY] = $derived(parseAnchor(anchor));
  const [selfX, selfY] = $derived(parseAnchor(self));
  const portalTarget = $derived(browser ? getOverlayPortalTarget(anchorEl) : undefined);
  // #endregion: --- Derived values

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

    syncPosition();
    const removeWindowScrollListener = on(window, "scroll", syncPosition, { capture: true });
    const removeWindowResizeListener = on(window, "resize", syncPosition);

    return () => {
      removeWindowScrollListener();
      removeWindowResizeListener();
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
    const removeDocumentKeydownListener = on(document, "keydown", handleDocumentKeydown, {
      capture: true,
    });

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
  export function show() {
    value = true;
  }

  export function hide() {
    value = false;
  }

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
    requestAnimationFrame(syncPosition);
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

  function syncPosition() {
    if (!browser || !anchorEl || !menuEl) {
      return;
    }

    const rect = anchorEl.getBoundingClientRect();
    const dialog = anchorEl.closest("dialog");
    const shouldUsePopover = doesOverlayUsePopover(anchorEl);
    const dialogRect = dialog?.open && !shouldUsePopover ? dialog.getBoundingClientRect() : null;
    const margin = 8;
    const maxViewportWidth = window.innerWidth - margin * 2;
    const baseTop = rect.top + rect.height * anchorY;
    const baseLeft = rect.left + rect.width * anchorX;
    const measured = menuEl.getBoundingClientRect();
    const measuredWidth = fit ? Math.min(rect.width, maxViewportWidth) : measured.width;

    const top = baseTop - measured.height * selfY;
    const left = baseLeft - measuredWidth * selfX;

    menuWidth = fit ? `${rect.width}px` : undefined;
    menuMaxWidth = fit ? `${maxViewportWidth}px` : undefined;

    if (dialogRect) {
      menuPosition = "absolute";
      menuTop = top - dialogRect.top;
      menuLeft = left - dialogRect.left;
      return;
    }

    menuPosition = "fixed";
    menuTop = Math.max(margin, Math.min(top, window.innerHeight - measured.height - margin));
    menuLeft = Math.max(margin, Math.min(left, window.innerWidth - measuredWidth - margin));
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
    if (!value || event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    hide();
  }

  function handleMenuClick() {
    if (autoClose) {
      hide();
    }
  }
  // #endregion: --- Functions

  Q.classes("q-menu", {
    classes: [userClass],
  });
</script>

<div bind:this={helperEl} class="q-menu__helper" aria-hidden="true"></div>

{#if value}
  <div
    bind:this={menuEl}
    use:usePortal={portalTarget}
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
  >
    {@render children?.()}
  </div>
{/if}
