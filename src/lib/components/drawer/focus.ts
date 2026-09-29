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
    .sort(
      (first, second) =>
        (Math.max(0, first.tabIndex) || Infinity) - (Math.max(0, second.tabIndex) || Infinity)
    );
}

export function isActiveModalDrawer(drawer: HTMLElement): boolean {
  return (
    modalDrawers.findLast(canFocus) === drawer &&
    !Array.from(document.querySelectorAll("dialog:modal")).some(
      (dialog) => !dialog.contains(drawer)
    )
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

  function handleFocus(event: FocusEvent) {
    if (!isActiveModalDrawer(drawer) || !(event.target instanceof HTMLElement)) {
      return;
    }

    if (containsWithPortals(drawer, event.target)) {
      lastFocused = event.target;
    } else if (lastFocused?.isConnected && canFocus(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
    } else {
      focusFirst();
    }
  }

  async function handleKeydown(event: KeyboardEvent) {
    if (
      !isActiveModalDrawer(drawer) ||
      event.defaultPrevented ||
      event.isComposing ||
      event.keyCode === 229
    ) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      dismiss();
    } else if (event.key === "Tab") {
      event.preventDefault();
      // Let nested controls finish closing their menus before choosing the next target.
      await tick();

      if (!isActiveModalDrawer(drawer)) {
        return;
      }

      const candidates = getTabStops(drawer);
      const currentIndex = candidates.indexOf(document.activeElement as HTMLElement);
      const nextIndex = event.shiftKey
        ? (currentIndex <= 0 ? candidates.length : currentIndex) - 1
        : (currentIndex + 1) % candidates.length;

      (candidates[nextIndex] ?? drawer).focus();
    }
  }

  const removeFocusListener = on(document, "focusin", handleFocus);
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
