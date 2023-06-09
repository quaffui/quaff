<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import { type QDialogProps } from "./props";
  import QBtn from "../button/QBtn.svelte";
  import { clickOutsideDialog } from "$lib/helpers";

  export let value: QDialogProps["value"] = false,
    btnContent: QDialogProps["btnContent"] = "",
    position: QDialogProps["position"] = "default",
    modal: QDialogProps["modal"] = false,
    fullscreen: QDialogProps["fullscreen"] = false,
    persistent: QDialogProps["persistent"] = false,
    userClasses: QDialogProps["userClasses"] = undefined;
  export { userClasses as class };

  let canHideOnClickOutside = false;
  let lateValue = false;

  $: setTimeout(() => {
    lateValue = value;
  }, 50);

  $: if (value === true && persistent !== true) {
    setTimeout(() => {
      canHideOnClickOutside = true;
    }, 50);
  } else {
    canHideOnClickOutside = false;
  }

  $: positionClass = ["top", "right", "bottom", "left"].includes(position) ? position : undefined;

  $: classes = createClasses([
    "q-dialog",
    value && "active",
    positionClass,
    modal && "modal",
    fullscreen && "max",
    userClasses,
  ]);

  let dialogElement: HTMLDialogElement | null = null;
  const emit = createEventDispatcher();

  $: if (value === false) {
    dialogElement?.close();
  } else {
    console.log({ modal });
    modal === true ? dialogElement?.showModal() : dialogElement?.show();
  }

  export function hide() {
    if (value === true) {
      value = false;
    }
  }

  export function show() {
    if (value === false) {
      value = true;
    }
  }

  export function toggle() {
    value = !value;
  }

  function handleKeyboardHide(e: Event) {
    if (canHideOnClickOutside) {
      hide();
    } else {
      if (persistent) {
        dialogElement?.classList.add("animating");

        setTimeout(() => {
          dialogElement?.classList.remove("animating");
        }, 150);
      }
      e.preventDefault();
    }
  }

  function handleClickHide() {
    if (canHideOnClickOutside) {
      hide();
    } else {
      if (persistent && lateValue) {
        dialogElement?.classList.add("animating");

        setTimeout(() => {
          dialogElement?.classList.remove("animating");
        }, 150);
      }
    }
  }
</script>

<QBtn on:click={() => emit("btnClick")}>
  <slot name="button">
    {btnContent}
  </slot>
</QBtn>
<dialog
  use:clickOutsideDialog={handleClickHide}
  class={classes}
  open={value}
  {...$$restProps}
  bind:this={dialogElement}
  on:cancel={handleKeyboardHide}
>
  <slot />
</dialog>

<style lang="scss">
  dialog.q-dialog {
    animation-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);

    &:is(.left, .right, .top, .bottom) {
      border-radius: 0;
    }
    &.modal::backdrop {
      display: block;
      background-color: rgba(0, 0, 0, 0.5);
    }

    &.animating {
      animation: shake 0.15s;
    }
  }

  @keyframes shake {
    0% {
      scale: 1;
    }
    50% {
      scale: 1.04;
    }
    100% {
      scale: 1;
    }
  }
</style>
