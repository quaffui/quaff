<script lang="ts">
  import { clickOutsideDialog } from "$lib/helpers";
  import { createClasses } from "$lib/utils";
  import { createEventDispatcher } from "svelte";
  import { QBtn } from "$lib";
  import type { QDialogProps } from "./props";

  export let noBtn: QDialogProps["noBtn"] = false,
    btnContent: QDialogProps["btnContent"] = undefined,
    btnAttrs: QDialogProps["btnAttrs"] = {},
    position: QDialogProps["position"] = "default",
    modal: QDialogProps["modal"] = false,
    fullscreen: QDialogProps["fullscreen"] = false,
    persistent: QDialogProps["persistent"] = false,
    userClasses: QDialogProps["userClasses"] = undefined,
    value: QDialogProps["value"] = false;
  export { userClasses as class };

  const emit = createEventDispatcher();
  let dialogElement: HTMLDialogElement | undefined;

  const DURATION_TOGGLE = 150;

  $: if (dialogElement) {
    if (value) {
      dialogElement.style.display = "block";
      modal ? dialogElement.showModal() : dialogElement.show();
    } else {
      dialogElement.close();
      setTimeout(() => {
        dialogElement!.style.display = "none";
      }, DURATION_TOGGLE);
    }
  }

  $: canHideOnClickOutside = value && !persistent;

  $: positionClass = ["top", "right", "bottom", "left"].includes(position!) ? position : undefined;

  $: classes = createClasses(
    [value && "active", positionClass, modal && "modal", fullscreen && "max"],
    {
      component: "q-dialog",
      userClasses,
    }
  );

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
      }, DURATION_TOGGLE);
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
  {...$$restProps}
  bind:this={dialogElement}
  on:cancel={handleKeyboardHide}
>
  <slot />
</dialog>
