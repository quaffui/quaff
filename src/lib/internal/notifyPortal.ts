import { on } from "svelte/events";
import { getOverlayPortalTarget } from "#utils/dom.js";

function findTopModalDialog() {
  const focusedDialog = document.activeElement?.closest<HTMLDialogElement>("dialog:modal");

  if (focusedDialog) {
    return focusedDialog;
  }

  // Hit testing follows native modal order when focus is absent.
  for (const dialog of document.querySelectorAll<HTMLDialogElement>("dialog:modal")) {
    const bounds = dialog.getBoundingClientRect();
    const x = Math.max(0, Math.min(innerWidth - 1, bounds.x + bounds.width / 2));
    const y = Math.max(0, Math.min(innerHeight - 1, bounds.y + bounds.height / 2));
    const owner = document.elementFromPoint(x, y)?.closest<HTMLDialogElement>("dialog:modal");

    if (owner) {
      return owner;
    }
  }
}

/** Keep the active notification interactive above native modal dialogs. */
export function attachNotifyPortal(container: HTMLElement) {
  let removeCloseListener: (() => void) | undefined;

  function syncHost(openedDialog?: HTMLDialogElement) {
    let owner = findTopModalDialog();

    // An opening dialog can still be hidden by its entrance transition.
    if (!owner && openedDialog?.matches(":modal")) {
      owner = openedDialog;
    }

    owner ??= container.closest<HTMLDialogElement>("dialog:modal") ?? undefined;
    const target = getOverlayPortalTarget(owner);

    if (container.parentNode !== target || (owner && owner === openedDialog)) {
      removeCloseListener?.();
      container.hidePopover?.();
      target.appendChild(container);
      // Close events still reach the owner after close() followed by removal.
      removeCloseListener = owner ? on(owner, "close", () => syncHost()) : undefined;
    }

    container.showPopover?.();
  }

  const removeToggleListener = on(
    document,
    "toggle",
    (event) => {
      if (event.target instanceof HTMLDialogElement) {
        const openedDialog = event.newState === "open" ? event.target : undefined;
        syncHost(openedDialog);
      }
    },
    { capture: true }
  );
  syncHost();

  return () => {
    removeToggleListener();
    removeCloseListener?.();
    container.hidePopover?.();
    container.remove();
  };
}
