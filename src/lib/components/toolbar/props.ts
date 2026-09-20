import type { HTMLAttributes } from "svelte/elements";

export interface QToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Uses a rounded, elevated container that fits its contents instead of a full-width docked bar.
   */
  floating?: boolean;

  /**
   * Arranges controls vertically. Vertical toolbars always use the floating layout.
   */
  vertical?: boolean;

  /**
   * Uses the vibrant color scheme.
   */
  vibrant?: boolean;

  /**
   * Removes the floating toolbar's shadow.
   */
  unelevated?: boolean;
}
