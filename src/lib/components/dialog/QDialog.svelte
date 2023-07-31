<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import { createEventDispatcher } from "svelte";
  import type { QDialogProps } from "./props";
  import QBtn from "../button/QBtn.svelte";
  import { clickOutsideDialog } from "$lib/helpers";

  export let value: QDialogProps["value"] = true,
    noBtn: QDialogProps["noBtn"] = false,
    btnContent: QDialogProps["btnContent"] = undefined,
    btnAttrs: QDialogProps["btnAttrs"] = {},
    position: QDialogProps["position"] = "default",
    modal: QDialogProps["modal"] = false,
    fullscreen: QDialogProps["fullscreen"] = false,
    persistent: QDialogProps["persistent"] = false,
    userClasses: QDialogProps["userClasses"] = undefined;
  export { userClasses as class };

  const emit = createEventDispatcher();
  let dialogElement: HTMLDialogElement;

  $: canHideOnClickOutside = value === true && persistent !== true;

  $: positionClass = ["top", "right", "bottom", "left"].includes(position!) ? position : undefined;

  $: classes = createClasses([
    "q-dialog",
    value && "active",
    positionClass,
    modal && "modal",
    fullscreen && "max",
    userClasses,
  ]);

  $: value === true
    ? modal
      ? dialogElement?.showModal()
      : dialogElement?.show()
    : dialogElement?.close();

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
  export function toggle(e: MouseEvent) {
    value = !value;
    e.stopPropagation();
  }

  function addAnimation() {
    if (persistent && value === true) {
      dialogElement?.classList.add("animating");

      setTimeout(() => {
        dialogElement?.classList.remove("animating");
      }, 150);
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

{#if noBtn === false}
  <QBtn {...btnAttrs} on:click={toggle} on:click={(event) => emit("btnClick", event)}>
    <slot name="button">
      {btnContent || ""}
    </slot>
  </QBtn>
{/if}

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
