<script lang="ts">
  import { clickOutsideDialog } from "$lib/helpers";
  import { createEventDispatcher } from "svelte";
  import { QBtn } from "$lib";
  import type { QDialogProps } from "./props";

  export let button: QDialogProps["button"] = false,
    buttonLabel: QDialogProps["buttonLabel"] = undefined,
    buttonProps: QDialogProps["buttonProps"] = {},
    position: QDialogProps["position"] = "default",
    modal: QDialogProps["modal"] = false,
    fullscreen: QDialogProps["fullscreen"] = false,
    persistent: QDialogProps["persistent"] = false,
    userClasses: QDialogProps["userClasses"] = "",
    value: QDialogProps["value"] = false;
  export { userClasses as class };

  const emit = createEventDispatcher();
  let dialogElement: HTMLDialogElement | undefined;

  const ANIMATION_DURATION = 150;

  $: if (dialogElement) {
    if (value) {
      dialogElement.style.display = "block";
      modal ? dialogElement.showModal() : dialogElement.show();
    } else {
      dialogElement.close();
      setTimeout(() => {
        dialogElement!.style.display = "none";
      }, ANIMATION_DURATION);
    }
  }

  $: canHideOnClickOutside = value && !persistent;

  export function hide() {
    value = false;
  }

  export function show() {
    value = true;
  }

  export function toggle(e?: MouseEvent) {
    value = !value;
    e?.stopPropagation();
  }

  function addAnimation() {
    if (persistent && value) {
      dialogElement?.classList.add("animating");
      setTimeout(() => {
        dialogElement?.classList.remove("animating");
      }, ANIMATION_DURATION);
    }
  }

  function handleKeyboardHide(e: Event) {
    if (canHideOnClickOutside) {
      hide();
    } else {
      addAnimation();
      e.preventDefault();
    }
  }

  function handleClickHide() {
    if (canHideOnClickOutside) {
      hide();
    } else {
      addAnimation();
    }
  }
</script>

{#if button}
  <QBtn
    {...buttonProps}
    label={buttonLabel}
    on:click={toggle}
    on:click={(event) => emit("buttonClick", event)}
  >
    <slot name="button" />
  </QBtn>
{/if}

<dialog
  use:clickOutsideDialog={handleClickHide}
  class="q-dialog {userClasses}"
  class:q-dialog--active={value}
  class:q-dialog--position-default={position === "default" || !position}
  class:q-dialog--position-top={position === "top"}
  class:q-dialog--position-right={position === "right"}
  class:q-dialog--position-bottom={position === "bottom"}
  class:q-dialog--position-left={position === "left"}
  class:q-dialog--modal={modal}
  class:q-dialog--fullscreen={fullscreen}
  {...$$restProps}
  bind:this={dialogElement}
  on:cancel={handleKeyboardHide}
>
  <slot />
</dialog>
