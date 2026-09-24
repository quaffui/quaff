<!--
@component
Bottom sheets show supporting content and actions at the bottom of a screen.
-->

<script lang="ts">
  import { getAbortSignal, tick, untrack } from "svelte";
  import { on } from "svelte/events";
  import type { QEvent } from "$utils";
  import type { QBottomSheetProps } from "./props";

  // #region:    --- Props
  let {
    value = $bindable(false),
    modal = false,
    expanded = $bindable(false),
    expandLabel = "Expand sheet",
    collapseLabel = "Collapse sheet",
    children,
    onclick,
    onpointerdown,
    oncancel,
    onclose,
    ...props
  }: QBottomSheetProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let sheetEl = $state<HTMLElement>();
  let dragHeight = $state<number>();
  let isVisible = $state(false);
  // #endregion: --- Reactive variables

  // #region:    --- Non-reactive variables
  const sheetId = $props.id();
  const contentId = `${sheetId}-content`;
  const dragStartThreshold = 4;
  const dragCommitRatio = 0.25;
  const maxDragCommitDistance = 32;
  const hasNativeTransitions =
    typeof CSS !== "undefined" &&
    CSS.supports("overlay", "auto") &&
    CSS.supports("transition-behavior", "allow-discrete");
  let previousFocus: Element | null = null;
  let isScrimPress = false;
  let hasDragged = false;
  let drag: { pointerId: number; startY: number; height: number } | undefined;
  // #endregion: --- Non-reactive variables

  // #region:    --- Derived values
  const isClosing = $derived(!value && isVisible && !hasNativeTransitions);
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect(() => {
    const element = sheetEl;
    const isOpen = value;

    if (!element) {
      return;
    }

    const signal = getAbortSignal();
    untrack(() => syncVisibility(element, isOpen, signal));
  });

  $effect(() => {
    if (value && !modal) {
      return on(window, "keydown", handleWindowKeydown);
    }
  });

  $effect(() => {
    const element = sheetEl;

    return () => {
      drag = undefined;
      dragHeight = undefined;

      if (element instanceof HTMLDialogElement) {
        element.close();
      }
    };
  });
  // #endregion: --- Effects

  // #region:    --- Methods
  /** Opens the sheet. */
  export function show() {
    value = true;
  }

  /** Closes the sheet. */
  export function hide() {
    if (
      !modal &&
      sheetEl?.contains(document.activeElement) &&
      previousFocus instanceof HTMLElement
    ) {
      previousFocus.focus();
    }

    value = false;
  }

  /** Toggles the sheet open state. */
  export function toggle() {
    if (value) {
      hide();
    } else {
      show();
    }
  }
  // #endregion: --- Methods

  // #region:    --- Functions
  async function syncVisibility(element: HTMLElement, isOpen: boolean, signal: AbortSignal) {
    if (isOpen) {
      // Preserve the dragged height during dismissal; reset it when reopening.
      dragHeight = undefined;

      if (!isVisible) {
        previousFocus = document.activeElement;
      }

      isVisible = true;

      if (element instanceof HTMLDialogElement) {
        if (!element.open) {
          element.showModal();
        } else if (!element.contains(document.activeElement)) {
          element.querySelector<HTMLButtonElement>(".q-bottom-sheet__handle")?.focus();
        }
      }

      return;
    }

    drag = undefined;

    if (isVisible && !hasNativeTransitions) {
      await tick();

      if (signal.aborted) {
        return;
      }

      const transitions = element
        .getAnimations()
        .filter(
          (animation) =>
            animation instanceof CSSTransition && animation.transitionProperty === "translate"
        );
      await Promise.allSettled(transitions.map((animation) => animation.finished));

      if (signal.aborted) {
        return;
      }
    }

    isVisible = false;

    if (element instanceof HTMLDialogElement) {
      element.close();
    }
  }

  function isOutsideSheet(event: MouseEvent) {
    const bounds = sheetEl!.getBoundingClientRect();
    return (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    );
  }

  function handlePointerdown(event: QEvent<PointerEvent, HTMLElement>) {
    onpointerdown?.(event);
    isScrimPress =
      !event.defaultPrevented && modal && event.target === sheetEl && isOutsideSheet(event);
  }

  function handleClick(event: QEvent<MouseEvent, HTMLElement>) {
    onclick?.(event);

    if (
      !event.defaultPrevented &&
      isScrimPress &&
      event.target === sheetEl &&
      isOutsideSheet(event)
    ) {
      hide();
    }

    isScrimPress = false;
  }

  function handleCancel(event: QEvent<Event, HTMLElement>) {
    oncancel?.(event);

    if (!event.defaultPrevented) {
      event.preventDefault();
      hide();
    }
  }

  function handleClose(event: QEvent<Event, HTMLElement>) {
    const element = event.currentTarget;

    if (element === sheetEl && element instanceof HTMLDialogElement && !element.open) {
      value = false;
      onclose?.(event);
    }
  }

  function handleWindowKeydown(event: KeyboardEvent) {
    if (
      event.defaultPrevented ||
      event.key !== "Escape" ||
      !sheetEl?.contains(document.activeElement) ||
      sheetEl.querySelector("dialog:modal")
    ) {
      return;
    }

    event.preventDefault();
    hide();
  }

  function toggleExpanded(event: MouseEvent) {
    if (!hasDragged || event.detail === 0) {
      expanded = !expanded;
    }

    hasDragged = false;
  }

  function startDrag(event: QEvent<PointerEvent, HTMLButtonElement>) {
    if (event.defaultPrevented || !event.isPrimary || event.button !== 0 || !sheetEl) {
      return;
    }

    drag = {
      pointerId: event.pointerId,
      startY: event.clientY,
      height: sheetEl.getBoundingClientRect().height,
    };
    hasDragged = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const distance = drag.startY - event.clientY;

    if (Math.abs(distance) > dragStartThreshold) {
      hasDragged = true;
      dragHeight = Math.max(0, drag.height + distance);
    }
  }

  function finishDrag(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const distance = drag.startY - event.clientY;
    const threshold = Math.min(drag.height * dragCommitRatio, maxDragCommitDistance);

    if (hasDragged && Math.abs(distance) >= threshold) {
      if (distance > 0) {
        expanded = true;
      } else if (expanded) {
        expanded = false;
      } else {
        hide();
      }
    }

    cancelDrag(event);
  }

  function cancelDrag(event: PointerEvent) {
    if (event.pointerId === drag?.pointerId) {
      drag = undefined;

      if (value) {
        dragHeight = undefined;
      }
    }
  }
  // #endregion: --- Functions

  Q.classes("q-bottom-sheet", {
    bemClasses: {
      standard: !modal,
      expanded,
      dragging: dragHeight !== undefined,
      closing: isClosing,
    },
    classes: [props.class],
  });
</script>

<svelte:element
  this={modal ? "dialog" : "section"}
  bind:this={sheetEl}
  {...props}
  class="q-bottom-sheet"
  hidden={!modal && !value && !isClosing}
  inert={!value}
  style:--q-bottom-sheet-drag-height={dragHeight === undefined ? undefined : `${dragHeight}px`}
  onclick={handleClick}
  onpointerdown={handlePointerdown}
  oncancel={handleCancel}
  onclose={handleClose}
  data-quaff
  data-quaff-overlay
>
  <button
    type="button"
    class="q-bottom-sheet__handle"
    aria-label={expanded ? collapseLabel : expandLabel}
    aria-expanded={expanded}
    aria-controls={contentId}
    onclick={toggleExpanded}
    onpointerdown={startDrag}
    onpointermove={moveDrag}
    onpointerup={finishDrag}
    onpointercancel={cancelDrag}
    onlostpointercapture={cancelDrag}><span></span></button
  >
  <div id={contentId} class="q-bottom-sheet__content">
    {@render children?.()}
  </div>
  {#if modal}
    <div class="q-bottom-sheet__overlay-root" data-quaff-overlay-root></div>
  {/if}
</svelte:element>
