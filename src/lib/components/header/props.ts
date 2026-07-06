import { HTMLAttributes } from "svelte/elements";
import { Borderable } from "$utils";

export interface QHeaderProps extends Borderable, HTMLAttributes<HTMLElement> {
  /**
   * Adds horizontal padding to the toolbar content.
   */
  inset?: boolean;

  /**
   * Adds a drop shadow to the toolbar.
   */
  elevated?: boolean;

  /**
   * Height in pixels of the toolbar.
   */
  height?: number;

  /**
   * Hides the toolbar when the user scrolls down the page and shows the toolbar when the user scrolls up the page.
   */
  reveal?: boolean;

  /**
   * The offset in pixels to trigger the reveal effect. The toolbar will be hidden when the scroll position is greater than this value.
   */
  revealOffset?: number;
}
