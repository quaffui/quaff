import { HTMLAttributes } from "svelte/elements";
import { Borderable } from "$utils";

export interface QHeaderProps extends Borderable, HTMLAttributes<HTMLElement> {
  /**
   * Adds extra left padding to the app bar content.
   */
  inset?: boolean;

  /**
   * Adds a drop shadow to the app bar.
   */
  elevated?: boolean;

  /**
   * Height in pixels of the app bar.
   */
  height?: number;

  /**
   * When used in QLayout, hides the app bar on scroll down and shows it on scroll up.
   */
  reveal?: boolean;

  /**
   * The offset in pixels to trigger the reveal effect. The app bar will be hidden when the scroll position is greater than this value.
   */
  revealOffset?: number;
}

export interface QHeaderTitleProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Keeps the title at its natural width instead of filling the available app bar space.
   */
  shrink?: boolean;
}
