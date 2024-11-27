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

type EventMap<T> = T extends HTMLElement
  ? HTMLElementEventMap
  : T extends typeof window
    ? WindowEventMap
    : DocumentEventMap;

/**
 * Adds an event listener to an element.
 *
 * @param el The element to add the event listener to. If `null` or `undefined`, nothing is added.
 * @param event The event to listen for.
 * @param callback The function to call when the event is triggered.
 * @returns An object with a single method, `remove()`, which removes the event listener.
 */
export function addEventListener<
  T extends HTMLElement | typeof window | typeof document,
  K extends keyof EventMap<T>,
>(
  el: T | undefined | null,
  event: K,
  callback: (e: EventMap<T>[K]) => void
): {
  remove: () => void;
};
/**
 * Adds multiple event listeners to an element.
 *
 * @param el The element to add the event listener to. If `null` or `undefined`, nothing is added.
 * @param events The events to listen for.
 * @param callback The function to call when any of the events are triggered.
 * @returns An object with a single method, `remove()`, which removes the event listeners.
 */
export function addEventListener<
  T extends HTMLElement | typeof window | typeof document,
  K extends keyof EventMap<T>,
>(
  el: T | undefined | null,
  events: K[],
  callback: (e: EventMap<T>[K]) => void
): {
  remove: () => void;
};
/**
 * Adds one or more event listeners to an element.
 *
 * @param el The element to add the event listener(s) to. If `null` or `undefined`, no action is taken.
 * @param events An event or an array of events to listen for.
 * @param callback The function to call when the event(s) are triggered.
 * @returns An object with a `remove()` method to remove the event listener(s) added.
 */
export function addEventListener<
  T extends HTMLElement | typeof window | typeof document,
  K extends keyof EventMap<T>,
>(el: T | undefined | null, events: K | K[], callback: (e: EventMap<T>[K]) => void) {
  if (!el) {
    return;
  }

  if (Array.isArray(events)) {
    const listeners = events.map((event) => addEventListener(el, event, callback));

    return {
      remove: () => listeners.forEach((listener) => listener.remove()),
    };
  }

  // Type casting to align with the broader compatibility between HTMLElement, Window, and Document
  el.addEventListener(events as string, callback as EventListener);

  return {
    remove: () => el.removeEventListener(events as string, callback as EventListener),
  };
}
