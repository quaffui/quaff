import { Borderable } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QToolbarProps extends Borderable, HTMLAttributes<HTMLElement> {
  /**
   * Adds horizontal padding to the toolbar content.
   */
  inset?: boolean;

  /**
   * Adds a shadow to the toolbar to make it appear elevated.
   */
  elevate?: boolean;

  /**
   * Height of the toolbar in pixels.
   */
  height?: number;
}

export interface QToolbarTitleProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Allows the title to shrink when there isn't enough space in the toolbar.
   */
  shrink?: boolean;
}
