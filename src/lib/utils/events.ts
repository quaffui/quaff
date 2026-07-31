export type Direction = "previous" | "next";

// Keyboard events
export function isActivationKey(e: KeyboardEvent) {
  return e.key === "Enter" || e.code === "Enter" || e.key === " " || e.code === "Space";
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
