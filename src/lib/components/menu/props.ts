import { OptionalModel } from "$utils";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QMenuAnchor =
  | "top start"
  | "top end"
  | "top left"
  | "top middle"
  | "top right"
  | "center start"
  | "center end"
  | "center left"
  | "center middle"
  | "center right"
  | "bottom start"
  | "bottom end"
  | "bottom left"
  | "bottom middle"
  | "bottom right";

export interface QMenuProps extends OptionalModel<boolean>, HTMLAttributes<HTMLDivElement> {
  /**
   * Element to anchor the menu to. When omitted, QMenu anchors to the nearest parent Quaff component.
   */
  target?: HTMLElement;

  /**
   * Offset in pixels. Positive values move the menu right/down, negative values left/up.
   * The vertical offset reverses when the menu flips.
   */
  offset?: { x?: number; y?: number };

  /** Flips a top/bottom anchored menu when the opposite side has more room. */
  flip?: boolean;

  /**
   * Anchor point on the target. Start/end follow the menu direction; left/right stay physical.
   */
  anchor?: QMenuAnchor;

  /**
   * Anchor point on the menu. Start/end follow the menu direction; left/right stay physical.
   */
  self?: QMenuAnchor;

  /**
   * Sets the menu width to the target width.
   */
  fit?: boolean;

  /**
   * Uses the Material 3 Expressive menu shapes and colors. When omitted, inherits the `Quaff.init()` setting (false by default). Set true or false to override it.
   */
  expressive?: boolean;

  /**
   * Prevents outside click dismissal.
   */
  persistent?: boolean;

  /**
   * Closes the menu when its content is clicked.
   */
  autoClose?: boolean;

  children?: Snippet;
}
