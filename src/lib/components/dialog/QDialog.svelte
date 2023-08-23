<script lang="ts">
  import { clickOutsideDialog } from "$lib/helpers";
  import { createClasses } from "$lib/utils";
  import { createEventDispatcher, onMount } from "svelte";
  import { QBtn } from "..";
  import type { QDialogProps } from "./props";

  export let noBtn: QDialogProps["noBtn"] = false,
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

  let opened = false;

  onMount(() => {
    opened = dialogElement.open;
    dialogElement.style.display = opened ? "block" : "none";
  });

  $: canHideOnClickOutside = opened && persistent !== true;

  $: positionClass = ["top", "right", "bottom", "left"].includes(position!) ? position : undefined;

  $: classes = createClasses(
    [opened && "active", positionClass, modal && "modal", fullscreen && "max"],
    {
      component: "q-dialog",
      userClasses,
    }
  );

  export function hide() {
    if (dialogElement && dialogElement.open) {
      dialogElement.close();
      opened = false;
      setTimeout(() => {
        dialogElement.style.display = "none";
      }, 250);
    }
  }
  export function show() {
    if (dialogElement && !dialogElement.open) {
      modal ? dialogElement.showModal() : dialogElement.show();
      opened = true;
      dialogElement.style.display = "block";
    }
  }
  export function toggle(e: MouseEvent) {
    if (dialogElement) {
      opened = !opened;
      if (dialogElement.open) {
        hide();
      } else {
        show();
      }
    }
    e.stopPropagation();
  }

  function addAnimation() {
    if (persistent && opened) {
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
  {...$$restProps}
  bind:this={dialogElement}
  on:cancel={handleKeyboardHide}
>
  <slot />
</dialog>
