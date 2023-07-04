<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import { createEventDispatcher } from "svelte";
  import type { QDialogProps } from "./props";
  import QBtn from "../button/QBtn.svelte";
  import { clickOutsideDialog } from "$lib/helpers";

  export let value: QDialogProps["value"] = false,
    btnContent: QDialogProps["btnContent"] = undefined,
    btnAttrs: QDialogProps["btnAttrs"] = {},
    position: QDialogProps["position"] = "default",
    modal: QDialogProps["modal"] = false,
    fullscreen: QDialogProps["fullscreen"] = false,
    persistent: QDialogProps["persistent"] = false,
    userClasses: QDialogProps["userClasses"] = undefined;
  export { userClasses as class };
  export { hide, show, toggle };

  const emit = createEventDispatcher();
  let dialogElement: HTMLDialogElement | null = null;
  let lateValue = false;

  $: setTimeout(() => {
    lateValue = value!;
  }, 50);

  $: canHideOnClickOutside = lateValue === true && persistent !== true;

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

  function hide() {
    if (value === true) {
      value = false;
    }
  }
  function show() {
    if (value === false) {
      value = true;
    }
  }
  function toggle() {
    value = !value;
  }

  function addAnimation() {
    if (persistent && lateValue) {
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

<QBtn {...btnAttrs} on:click={() => (value = !value)} on:click={(event) => emit("btnClick", event)}>
  <slot name="button">
    {btnContent || ""}
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
