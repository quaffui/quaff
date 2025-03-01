import type { HTMLAttributes } from "svelte/elements";

export interface QToolbarProps extends HTMLAttributes<HTMLElement> {
  /**
   * Adds horizontal padding to the toolbar content.
   *
   * @default false
   */
  inset?: boolean;

  /**
   * Adds a border to the toolbar to separate it from the main content.
   *
   * @default false
   */
  border?: boolean;

  /**
   * Adds a shadow to the toolbar to make it appear elevated.
   *
   * @default false
   */
  elevate?: boolean;

  /**
   * Height of the toolbar in pixels.
   *
   * @default 64
   */
  height?: number;
}

export interface QToolbarTitleProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Allows the title to shrink when there isn't enough space in the toolbar.
   *
   * @default false
   */
  shrink?: boolean;
}
