import { HTMLAttributes } from "svelte/elements";
import { Clickable, QEvent } from "./types";

export type Direction = "previous" | "next";

// Keyboard events
export function isActivationKey(
  e: KeyboardEvent
): e is KeyboardEvent & { code: "Enter" | "Space" } {
  return e.code === "Enter" || e.code === "Space";
}

export function isArrowKey(
  e: KeyboardEvent
): e is KeyboardEvent & { code: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" } {
  return e.code.startsWith("Arrow");
}

export function isTabKey(e: KeyboardEvent): e is KeyboardEvent & { code: "Tab" } {
  return e.code === "Tab";
}

export function getDirection(
  e: KeyboardEvent & { code: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" }
): Direction {
  return ["ArrowDown", "ArrowRight"].includes(e.code) ? "next" : "previous";
}

export interface ActionableEventHandlers<El extends HTMLElement> {
  onAction?: (event: QEvent<MouseEvent, El>, ...args: unknown[]) => void | Promise<void>;
  onEscape?: (event: QEvent<KeyboardEvent, El>, ...args: unknown[]) => void | Promise<void>;
  onBackspace?: (event: QEvent<KeyboardEvent, El>, ...args: unknown[]) => void | Promise<void>;
}

export function getActionableEventHandlers<El extends HTMLElement>(
  props: Clickable & HTMLAttributes<El>,
  callbacks: ActionableEventHandlers<El> = {},
  ...args: unknown[]
) {
  if (props.disabled) {
    return {};
  }

  function handleKeyboardEvent(event: QEvent<KeyboardEvent, El>) {
    props.onkeydown?.(event);

    if (!isActivationKey(event) || event.defaultPrevented) {
      return;
    }

    if (event.key === "Escape") {
      callbacks.onEscape?.(event, ...args);
    } else if (event.key === "Backspace") {
      callbacks.onBackspace?.(event, ...args);
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const bounds = event.currentTarget.getBoundingClientRect();
    const clickEvent = new PointerEvent("click", {
      bubbles: true,
      cancelable: true,
      clientX: bounds.left + bounds.width / 2,
      clientY: bounds.top + bounds.height / 2,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
    });

    event.currentTarget.dispatchEvent(clickEvent);
  }

  function handleClickEvent(event: QEvent<MouseEvent, El>) {
    props.onclick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    callbacks.onAction?.(event, ...args);
  }

  return {
    onclick: handleClickEvent,
    onkeydown: handleKeyboardEvent,
  };
}
