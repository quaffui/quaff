import { portalParents } from "#internal/portalParent.js";
import type { Attachment } from "svelte/attachments";

export type PortalTarget = ParentNode | undefined;

export function portal(target?: PortalTarget, owner?: Node | null): Attachment<HTMLElement> {
  return (element) => {
    const parent = owner ?? portalParents.get(element) ?? element.parentNode;

    if (parent) {
      portalParents.set(element, parent);
    }

    (target ?? document.body).appendChild(element);

    return () => element.remove();
  };
}

export function getDialogOverlayRoot(dialog: HTMLDialogElement): ParentNode {
  return dialog.querySelector<HTMLElement>(":scope > [data-quaff-overlay-root]") ?? dialog;
}

export function closeNestedOverlays(element: HTMLElement) {
  for (const popover of element.querySelectorAll<HTMLElement>("[popover]")) {
    popover.hidePopover?.();
  }

  for (const dialog of Array.from(
    element.querySelectorAll<HTMLDialogElement>("dialog[open]")
  ).reverse()) {
    dialog.close();
  }
}

export function doesOverlayUsePopover(from: HTMLElement | null | undefined): boolean {
  return (
    typeof HTMLElement !== "undefined" &&
    "showPopover" in HTMLElement.prototype &&
    !!from?.closest("dialog")?.open
  );
}

export function getOverlayPortalTarget(from: HTMLElement | null | undefined): ParentNode {
  const dialog = from?.closest("dialog");
  if (dialog?.open) {
    return getDialogOverlayRoot(dialog);
  }

  return document.body;
}

// Focus utils
const focusableElements =
  ':is(a, button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])):not([disabled], [aria-disabled="true"])';

export function isFocusable(el: HTMLElement) {
  return (
    el.offsetWidth > 0 &&
    el.offsetHeight > 0 &&
    (el.style.opacity === "" || +el.style.opacity > 0) &&
    el.style.display !== "none" &&
    el.tabIndex >= 0
  );
}

export function getFocusableChildren<T extends HTMLElement>(el: T) {
  return Array.from(el.querySelectorAll(focusableElements)) as T[];
}

export function getClosestFocusableChild(el: HTMLElement) {
  const children = Array.from(el.querySelectorAll(focusableElements)) as HTMLElement[];
  const focusableChildren: HTMLElement[] = children.filter(isFocusable);

  return focusableChildren[0] || null;
}

export function shouldReduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function elFromSelector<T extends HTMLElement>(
  selector: string | T | null | typeof window | Document
) {
  return typeof selector === "string" ? document.querySelector<T>(selector) : selector;
}
