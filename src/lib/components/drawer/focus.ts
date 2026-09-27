import { tick } from "svelte";
import { on } from "svelte/events";
import { containsWithPortals } from "$internal/portalParent";

const FOCUSABLE_SELECTOR =
  'a[href], area[href], button, input, select, textarea, summary, iframe, [tabindex], [contenteditable]:not([contenteditable="false"])';
const modalDrawers: HTMLElement[] = [];

function canFocus(element: HTMLElement): boolean {
  return (
    !element.closest("[inert], dialog:not([open])") &&
    !element.matches(':disabled, [aria-disabled="true"]') &&
    element.checkVisibility({ visibilityProperty: true })
  );
}

function getTabStops(drawer: HTMLElement): HTMLElement[] {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => {
      const isEditable = element.isContentEditable && !element.hasAttribute("tabindex");
      return (
        (element.tabIndex >= 0 || isEditable) &&
        containsWithPortals(drawer, element) &&
        canFocus(element)
      );
    }
  );

  return candidates
    .filter((element) => {
      if (!(element instanceof HTMLInputElement) || element.type !== "radio" || !element.name) {
        return true;
      }

      const group = candidates.filter(
        (candidate): candidate is HTMLInputElement =>
          candidate instanceof HTMLInputElement &&
          candidate.type === "radio" &&
          candidate.name === element.name &&
          candidate.form === element.form
      );

      return element === (group.find((radio) => radio.checked) ?? group[0]);
    })
    .sort((first, second) => {
      const firstIndex = first.tabIndex > 0 ? first.tabIndex : Infinity;
      const secondIndex = second.tabIndex > 0 ? second.tabIndex : Infinity;
      return firstIndex - secondIndex;
    });
}

export function isActiveModalDrawer(drawer: HTMLElement): boolean {
  return (
    modalDrawers.findLast(canFocus) === drawer &&
    // Standard navigation rails also use an open dialog, with a presentation role.
    !Array.from(
      document.querySelectorAll<HTMLElement>(
        'dialog:modal, dialog[open]:not([role="presentation"])'
      )
    ).some((dialog) => canFocus(dialog) && !dialog.contains(drawer))
  );
}

export function containDrawerFocus(drawer: HTMLElement, dismiss: () => void) {
  const opener = document.activeElement;
  let lastFocused =
    opener instanceof HTMLElement && containsWithPortals(drawer, opener) ? opener : undefined;
  modalDrawers.push(drawer);
  // Equal-z-index drawers are painted in document order, regardless of opening order.
  modalDrawers.sort((first, second) =>
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  );

  function focusFirst() {
    const candidates = getTabStops(drawer);
    const destination = candidates.find((element) => element.matches(".q-nav-item, .q-item"));
    (destination ?? candidates[0] ?? drawer).focus();
  }

  function restoreFocus() {
    if (lastFocused?.isConnected && canFocus(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
    } else {
      focusFirst();
    }
  }

  function handleFocus(event: FocusEvent) {
    if (!isActiveModalDrawer(drawer) || !(event.target instanceof HTMLElement)) {
      return;
    }

    if (containsWithPortals(drawer, event.target)) {
      lastFocused = event.target;
    } else {
      restoreFocus();
    }
  }

  async function handleFocusout() {
    // Blurring or removing a focused popup can leave the body focused without a focusin event.
    await tick();
    const activeElement = document.activeElement;

    if (
      (!activeElement || activeElement === document.body) &&
      document.hasFocus() &&
      isActiveModalDrawer(drawer)
    ) {
      restoreFocus();
    }
  }

  async function handleKeydown(event: KeyboardEvent) {
    if (
      (event.key !== "Tab" && event.key !== "Escape") ||
      event.defaultPrevented ||
      event.isComposing ||
      event.keyCode === 229 ||
      !isActiveModalDrawer(drawer)
    ) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      dismiss();
    } else {
      event.preventDefault();
      // Let nested controls finish closing their menus before choosing the next target.
      await tick();

      if (!isActiveModalDrawer(drawer)) {
        return;
      }

      const candidates = getTabStops(drawer);
      const currentIndex = candidates.indexOf(document.activeElement as HTMLElement);
      let nextIndex = (currentIndex + 1) % candidates.length;

      if (event.shiftKey) {
        nextIndex = (currentIndex <= 0 ? candidates.length : currentIndex) - 1;
      }

      (candidates[nextIndex] ?? drawer).focus();
    }
  }

  const removeFocusListener = on(document, "focusin", handleFocus);
  const removeFocusoutListener = on(document, "focusout", handleFocusout);
  // Menus and other nested controls get the first chance to handle Escape and Tab.
  const removeKeyListener = on(window, "keydown", handleKeydown);

  if (isActiveModalDrawer(drawer) && !lastFocused) {
    focusFirst();
  }

  return (restoreFocus: boolean) => {
    const wasActive = modalDrawers.at(-1) === drawer;
    const activeElement = document.activeElement;
    const hadFocus = activeElement === document.body || containsWithPortals(drawer, activeElement);
    modalDrawers.splice(modalDrawers.indexOf(drawer), 1);
    removeFocusListener();
    removeFocusoutListener();
    removeKeyListener();

    if (
      restoreFocus &&
      wasActive &&
      hadFocus &&
      opener instanceof HTMLElement &&
      opener.isConnected &&
      canFocus(opener)
    ) {
      opener.focus({ preventScroll: true });
    }
  };
}
