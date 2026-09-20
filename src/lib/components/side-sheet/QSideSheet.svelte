<script lang="ts">
  import { tick } from "svelte";
  import { on } from "svelte/events";
  import QIconBtn from "$components/button/QIconBtn.svelte";
  import { useSize } from "$composables";
  import type { QEvent } from "$utils";
  import type { QSideSheetProps } from "./props";

  // #region:    --- Props
  let {
    value = $bindable(false),
    modal = false,
    headline,
    side = "end",
    width = "16rem",
    detached = false,
    bordered = false,
    closeLabel = "Close sheet",
    children,
    actions,
    onclick,
    onpointerdown,
    oncancel,
    onclose,
    ...props
  }: QSideSheetProps = $props();
  // #endregion: --- Props

  // #region:    --- State
  const componentId = $props.id();
  const headlineId = `${componentId}-headline`;
  let sheetEl = $state<HTMLDialogElement>();
  let hasBackdropPointerDown = false;
  let previousFocus: Element | null = null;
  // #endregion: --- State

  // #region:    --- Effects
  $effect.pre(() => {
    const element = sheetEl;

    return () => {
      if (element) {
        closeDialog(element);
      }
    };
  });

  $effect(() => {
    const element = sheetEl;

    if (!element) {
      return;
    }

    if (!value) {
      return closeAfterTransition(element);
    }

    const activeElement = document.activeElement;

    if (element.open && element.matches(":modal") !== modal) {
      closeDialog(element);
    }

    if (!element.open) {
      previousFocus = document.activeElement;

      if (modal) {
        element.showModal();
      } else {
        // Standard sheets keep the page's current focus.
        element.open = true;
      }
    }

    if (
      activeElement instanceof HTMLElement &&
      element.contains(activeElement) &&
      activeElement.checkVisibility()
    ) {
      activeElement.focus({ preventScroll: true });
    }

    if (!modal) {
      return on(window, "keydown", handleEscape);
    }
  });
  // #endregion: --- Effects

  // #region:    --- Methods
  /** Opens the sheet. */
  export function show() {
    value = true;
  }

  /** Closes the sheet. */
  export function hide() {
    value = false;
  }

  /** Toggles the sheet. */
  export function toggle() {
    value = !value;
  }
  // #endregion: --- Methods

  // #region:    --- Functions
  function closeAfterTransition(element: HTMLDialogElement) {
    if (!element.open) {
      return;
    }

    let isCanceled = false;
    closeNestedOverlays(element);

    async function finishClosing() {
      await tick();

      const transitions = element
        .getAnimations()
        .filter(
          (animation) =>
            animation instanceof CSSTransition &&
            ["translate", "margin-left", "margin-right"].includes(animation.transitionProperty)
        );
      await Promise.allSettled(transitions.map((transition) => transition.finished));

      if (!isCanceled && !value && element.open) {
        closeDialog(element);
      }
    }

    void finishClosing();

    return () => {
      isCanceled = true;
    };
  }

  function closeNestedOverlays(element: HTMLDialogElement) {
    for (const popover of element.querySelectorAll<HTMLElement>("[popover]")) {
      popover.hidePopover?.();
    }

    for (const dialog of Array.from(
      element.querySelectorAll<HTMLDialogElement>("dialog[open]")
    ).reverse()) {
      dialog.close();
    }
  }

  function closeDialog(element: HTMLDialogElement) {
    const canRestoreFocus = element.matches(":modal") || element.contains(document.activeElement);
    closeNestedOverlays(element);
    element.close();

    if (canRestoreFocus && previousFocus instanceof HTMLElement) {
      previousFocus.focus();
    }
  }

  function handleEscape(event: KeyboardEvent) {
    if (
      event.key === "Escape" &&
      !event.defaultPrevented &&
      sheetEl &&
      event
        .composedPath()
        .find(
          (target) => target instanceof Element && target.classList.contains("q-side-sheet")
        ) === sheetEl &&
      !sheetEl.querySelector("dialog:modal")
    ) {
      event.preventDefault();
      hide();

      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    }
  }

  function isBackdrop(event: MouseEvent) {
    if (!modal || event.target !== sheetEl || !sheetEl) {
      return false;
    }

    const { left, right, top, bottom } = sheetEl.getBoundingClientRect();
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
      hide();
    }

    hasBackdropPointerDown = false;
  }

  function handleCancel(event: QEvent<Event, HTMLDialogElement>) {
    oncancel?.(event);

    if (!event.defaultPrevented) {
      event.preventDefault();
      hide();
    }
  }

  function handleClose(event: QEvent<Event, HTMLDialogElement>) {
    if (event.target === sheetEl && sheetEl instanceof HTMLDialogElement && !sheetEl.open) {
      value = false;
      onclose?.(event);
    }
  }
  // #endregion: --- Functions

  Q.classes("q-side-sheet", {
    bemClasses: { standard: !modal, start: side === "start", detached, bordered, closing: !value },
    classes: [props.class],
  });
</script>

<dialog
  bind:this={sheetEl}
  {...props}
  class="q-side-sheet"
  aria-modal={modal || undefined}
  aria-labelledby={props["aria-labelledby"] ??
    (!props["aria-label"] && headline ? headlineId : undefined)}
  style:--q-side-sheet-width={useSize(width).style}
  onclick={handleClick}
  onpointerdown={handlePointerDown}
  oncancel={handleCancel}
  onclose={handleClose}
  data-quaff-overlay
  data-quaff
>
  <div class="q-side-sheet__container">
    <header class="q-side-sheet__header">
      {#if headline}
        <h2 id={headlineId} class="q-side-sheet__headline">{headline}</h2>
      {/if}
      <QIconBtn
        icon="close"
        type="button"
        expressive={false}
        color="on-surface-variant"
        aria-label={closeLabel}
        class="q-side-sheet__close"
        onclick={hide}
      />
    </header>
    <div class="q-side-sheet__content">
      {@render children?.()}
    </div>
    {#if actions}
      <footer class="q-side-sheet__actions">
        {@render actions()}
      </footer>
    {/if}
  </div>
  <div class="q-side-sheet__overlay-root" data-quaff-overlay-root></div>
</dialog>
