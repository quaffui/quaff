import type { Borderable } from "$utils";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

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
   * App bar size. Medium and large place a direct QHeaderTitle below the navigation and actions.
   */
  variant?: "small" | "medium" | "large";

  /**
   * Height in pixels. Small defaults to 64, growing for subtitles. An explicit small height stays fixed; flexible variants treat it as a minimum.
   */
  height?: number;

  /**
   * In QLayout, collapses a medium or large app bar to small when scrolling. Returns to its full size at the top.
   * Short pages stay expanded when collapsing would remove their scroll range.
   */
  collapse?: boolean;

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
   * Supporting text below the title.
   */
  subtitle?: string | Snippet;

  /**
   * Aligns the title and subtitle. Defaults to start in flexible app bars and center otherwise.
   */
  align?: "start" | "center";

  /**
   * Keeps the title at its natural width instead of filling the available app bar space.
   */
  shrink?: boolean;
}
