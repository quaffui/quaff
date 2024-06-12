<script lang="ts">
  import type { DialogProps } from "./props";

  let {
    value = $bindable(false),
    position = "default",
    modal = false,
    fullscreen = false,
    persistent = false,
    children,
    ...props
  }: DialogProps = $props();

  let dialogEl: HTMLDialogElement;

  $effect(() => {
    if (value) {
      dialogEl?.[modal ? "showModal" : "show"]();

      setTimeout(() => {
        window.addEventListener("click", tryCancel);
      }, 150);
    } else {
      dialogEl?.close();

      window.removeEventListener("click", tryCancel);
    }
  });

  const canHide = $derived(value && !persistent);

  const positionClass = $derived(
    ["top", "right", "bottom", "left"].includes(position) ? ` q-dialog--${position}` : ""
  );

  export function hide() {
    if (dialogEl && dialogEl.open) {
      value = false;
    }
  }

  export function show() {
    if (dialogEl && !dialogEl.open) {
      value = true;
    }
  }

  export function toggle() {
    if (dialogEl) {
      if (dialogEl.open) hide();
      else show();
    }
  }

  function addAnimation() {
    if (persistent && value) {
      dialogEl?.classList.add("q-dialog--animating");

      setTimeout(() => {
        dialogEl?.classList.remove("q-dialog--animating");
      }, 150);
    }
  }

  function handleClickInside(e: MouseEvent) {
    e.stopPropagation();
  }

  function tryCancel(e: Event) {
    if (canHide) {
      hide();
    } else {
      addAnimation();
      e.preventDefault();
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      tryCancel(e);
    }
  }

  Quaff.classes("q-dialog", {
    bemClasses: {
      active: value,
      fullscreen,
    },
    classes: [positionClass, props.class],
  });
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialogEl}
  {...props}
  class="q-dialog"
  {...Quaff.classes}
  onclick={handleClickInside}
  oncancel={tryCancel}
  onkeydown={onKeydown}
  aria-hidden={!value || undefined}
>
  {@render children?.()}
</dialog>

<style lang="scss">
  @import "./dialog.scss";
</style>
