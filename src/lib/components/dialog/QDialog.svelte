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

    let removeClickListener: (() => void) | undefined;

    const timeoutId = setTimeout(() => {
      removeClickListener = on(window, "click", tryCancel);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      removeClickListener?.();
    };
  });
  // #endregion: --- Effects

  // #region:    --- Methods
  export function hide() {
    if (dialogEl?.open) {
      value = false;
    }
  }

  export function show() {
    if (!dialogEl?.open) {
      value = true;
    }
  }

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

    if (!e.defaultPrevented && e.key === "Escape") {
      tryCancel(e);
    }
  }

  function handleCancel(e: QDialogEvent<Event>) {
    oncancel?.(e);

    if (!e.defaultPrevented) {
      tryCancel(e);
    }
  }

  function tryCancel(e: Event) {
    if (e.defaultPrevented) {
      return;
    }

    const target = e.target;

    if (target instanceof Element && target.closest("[data-quaff-overlay]")) {
      return;
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
  onkeydown={handleKeydown}
  aria-hidden={!value || undefined}
  data-quaff
>
  {@render children?.()}
  <div class="q-dialog__overlay-root" data-quaff-overlay-root></div>
</dialog>
