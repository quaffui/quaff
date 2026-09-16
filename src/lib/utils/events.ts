export type Direction = "previous" | "next";

// Keyboard events
export function isActivationKey(
  e: KeyboardEvent
): e is KeyboardEvent & { code: "Enter" | "Space" } {
  return e.code === "Enter" || e.code === "Space";
}

/** Activates a focused custom control without duplicating native keyboard clicks. */
export function handleActivationKeydown(event: KeyboardEvent & { currentTarget: HTMLElement }) {
  if (event.defaultPrevented || event.target !== event.currentTarget || !isActivationKey(event)) {
    return;
  }

  const element = event.currentTarget;
  const isNativeActivation =
    element.tagName === "BUTTON" || (element.matches("a[href]") && event.code === "Enter");

  if (!isNativeActivation) {
    event.preventDefault();
    element.click();
  }
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
