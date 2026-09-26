import type { HTMLAttributes } from "svelte/elements";

/** Restore the trigger's inherited context after an overlay is portalled. */
export function syncOverlayDirection(
  overlay: HTMLElement,
  trigger: HTMLElement,
  direction?: HTMLAttributes<HTMLElement>["dir"],
  language?: string | null
): "ltr" | "rtl" {
  const dir = direction ?? getComputedStyle(trigger).direction;
  const lang = language ?? trigger.closest("[lang]")?.getAttribute("lang") ?? "";

  if (overlay.getAttribute("dir") !== dir) {
    overlay.setAttribute("dir", dir);
  }

  if (overlay.getAttribute("lang") !== lang) {
    overlay.setAttribute("lang", lang);
  }

  // Explicit dir="auto" and CSS direction overrides must also control logical anchors.
  return getComputedStyle(overlay).direction === "rtl" ? "rtl" : "ltr";
}
