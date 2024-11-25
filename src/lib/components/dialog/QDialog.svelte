<script lang="ts">
  import type { QDialogProps } from "./props";

  let {
    value = $bindable(false),
    position = "default",
    modal = false,
    fullscreen = false,
    persistent = false,
    children,
    ...props
  }: QDialogProps = $props();

  let dialogEl: HTMLDialogElement;

  const canHide = $derived(value && !persistent);

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

  export function hide() {
    if (dialogEl.open) {
      value = false;
    }
  }

  export function show() {
    if (!dialogEl.open) {
      value = true;
    }
  }

  export function toggle() {
    if (dialogEl.open) {
      hide();
    } else {
      show();
    }
  }

  function addAnimation() {
    if (persistent && value) {
      dialogEl.classList.add("q-dialog--animating");

      setTimeout(() => {
        dialogEl.classList.remove("q-dialog--animating");
      }, 150);
    }
  }

  function handleClickInside(e: MouseEvent) {
    e.stopPropagation();
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      tryCancel(e);
    }
  }

  function tryCancel(e: Event) {
    if (canHide) {
      hide();
    } else {
      addAnimation();
      e.preventDefault();
    }
  }

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
  {...Q.classes}
  onclick={handleClickInside}
  oncancel={tryCancel}
  {onkeydown}
  aria-hidden={!value || undefined}
  data-quaff
>
  {@render children?.()}
</dialog>
