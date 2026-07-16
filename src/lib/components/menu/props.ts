import { OptionalModel } from "$utils";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QMenuAnchor =
  | "top left"
  | "top middle"
  | "top right"
  | "center left"
  | "center middle"
  | "center right"
  | "bottom left"
  | "bottom middle"
  | "bottom right";

export interface QMenuProps extends OptionalModel<boolean>, HTMLAttributes<HTMLDivElement> {
  /**
   * Element to anchor the menu to. When omitted, QMenu anchors to the nearest parent Quaff component.
   */
  target?: HTMLElement;

  /**
   * Anchor point on the target element.
   */
  anchor?: QMenuAnchor;

  /**
   * Anchor point on the menu element.
   */
  self?: QMenuAnchor;

  /**
   * Sets the menu width to the target width.
   */
  fit?: boolean;

  /**
   * Uses the Material 3 Expressive menu shapes and colors. Expressive mode can also be enabled globally through `Quaff.init()`.
   *
   * @default false
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
