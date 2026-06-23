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

export interface QMenuProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Bound open state.
   *
   * @default false
   * @bindable
   */
  value?: boolean;

  /**
   * Element to anchor the menu to. When omitted, QMenu anchors to the nearest parent Quaff component.
   *
   */
  target?: HTMLElement;

  /**
   * Anchor point on the target element.
   *
   * @default "bottom left"
   */
  anchor?: QMenuAnchor;

  /**
   * Anchor point on the menu element.
   *
   * @default "top left"
   */
  self?: QMenuAnchor;

  /**
   * Sets the menu width to the target width.
   *
   * @default false
   */
  fit?: boolean;

  /**
   * Prevents outside click dismissal.
   *
   * @default false
   */
  persistent?: boolean;

  /**
   * Closes the menu when its content is clicked.
   *
   * @default true
   */
  autoClose?: boolean;

  children?: Snippet;
}
