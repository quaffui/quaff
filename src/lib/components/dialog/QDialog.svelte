<script lang="ts" module>
  const modalDialogs: HTMLDialogElement[] = [];
  const dismissedEvents = new WeakSet<Event>();
</script>

<script lang="ts">
  import { on } from "svelte/events";
  import type { QEvent } from "$utils";
  import type { QDialogProps } from "./props";

  type QDialogEvent<T extends Event> = QEvent<T, HTMLDialogElement>;

  // #region:    --- Props
  let {
    value = $bindable(false),
    position = "default",
    modal = false,
    fullscreen = false,
    persistent = false,
    children,
    onclick,
    onkeydown,
    oncancel,
    onclose,
    ...props
  }: QDialogProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let dialogEl = $state<HTMLDialogElement>();
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const canHide = $derived(value && !persistent);
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect(() => {
    if (!value) {
      dialogEl?.close();
      return;
    }

    dialogEl?.[modal ? "showModal" : "show"]();

    const currentDialog = dialogEl;

    if (modal && currentDialog) {
      modalDialogs.push(currentDialog);
    }

    let removeClickListener: (() => void) | undefined;

    const timeoutId = setTimeout(() => {
      removeClickListener = on(window, "click", tryCancel);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      removeClickListener?.();

      const index = currentDialog ? modalDialogs.indexOf(currentDialog) : -1;

      if (index !== -1) {
        modalDialogs.splice(index, 1);
      }
    };
  });
  // #endregion: --- Effects

  // #region:    --- Methods
  /** Closes the dialog. */
  export function hide() {
    if (dialogEl?.open) {
      value = false;
    }
  }

  /** Opens the dialog. */
  export function show() {
    if (!dialogEl?.open) {
      value = true;
    }
  }

  /** Toggles the dialog open state. */
  export function toggle() {
    if (dialogEl?.open) {
      hide();
    } else {
      show();
    }
  }
  // #endregion: --- Methods

  // #region:    --- Functions
  function addAnimation() {
    if (persistent && value) {
      dialogEl?.classList.add("q-dialog--animating");

      setTimeout(() => {
        dialogEl?.classList.remove("q-dialog--animating");
      }, 150);
    }
  }

  function handleClickInside(e: QDialogEvent<MouseEvent>) {
    onclick?.(e);

    if (e.defaultPrevented) {
      return;
    }

    e.stopPropagation();
  }

  function handleKeydown(e: QDialogEvent<KeyboardEvent>) {
    onkeydown?.(e);

    if (
      !e.defaultPrevented &&
      e.key === "Escape" &&
      !dialogEl?.querySelector("[data-quaff-menu]")
    ) {
      tryCancel(e);
    }
  }

  function handleCancel(e: QDialogEvent<Event>) {
    oncancel?.(e);

    if (!e.defaultPrevented) {
      tryCancel(e);
    }
  }

  function handleClose(event: QDialogEvent<Event>) {
    if (event.target === dialogEl && !dialogEl?.open) {
      value = false;
      onclose?.(event);
    }
  }

  function tryCancel(e: Event) {
    const topModal = modalDialogs.findLast((dialog) => dialog.open);
    const blockedByModal =
      topModal && topModal !== dialogEl && (modal || !topModal.contains(dialogEl ?? null));

    if (e.defaultPrevented || dismissedEvents.has(e) || blockedByModal) {
      return;
    }

    const target = e.target;

    const overlay = target instanceof Element ? target.closest("[data-quaff-overlay]") : null;

    if (overlay && (!dialogEl || !overlay.contains(dialogEl))) {
      return;
    }

    dismissedEvents.add(e);

    if (e instanceof KeyboardEvent) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (canHide) {
      hide();
    } else {
      addAnimation();
      e.preventDefault();
    }
  }
  // #endregion: --- Functions

  Q.classes("q-dialog", {
    bemClasses: {
      active: value,
      fullscreen,
      modal,
      [position]: ["top", "right", "bottom", "left"].includes(position),
    },
    classes: [props.class],
  });
</script>

<dialog
  bind:this={dialogEl}
  {...props}
  class="q-dialog"
  onclick={handleClickInside}
  oncancel={handleCancel}
  onclose={handleClose}
  onkeydown={handleKeydown}
  aria-hidden={!value || undefined}
  data-quaff
>
  {@render children?.()}
  <div class="q-dialog__overlay-root" data-quaff-overlay-root></div>
</dialog>
