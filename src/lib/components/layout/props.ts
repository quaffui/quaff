import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

//prettier-ignore
export type QLayoutViewOptions = `${"l"|"h"}${"h"|"H"}${"r"|"h"} ${"l"|"L"}${"p"}${"r"|"R"} ${"l"|"f"}${"f"|"F"}${"r"|"f"}`

export interface QLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The layout view configuration, which defines how layout components (header, railbars, drawers, footer) should be displayed on screen.
   * Controls how layout components (header, railbars, drawers, footer) are displayed on screen.
   */
  view?: QLayoutViewOptions;

  /**
   * Main area of the layout where the content will be displayed, meaning everything besides the layout components (header, railbars, drawers, footer).
   * It overrides the default children snippet.
   */
  content?: Snippet;

  /**
   * The railbar on the left side of the layout.
   */
  railbarLeft?: Snippet;

  /**
   * The railbar on the right side of the layout.
   */
  railbarRight?: Snippet;

  /**
   * The drawer on the left side of the layout.
   */
  drawerLeft?: Snippet;

  /**
   * The drawer on the right side of the layout.
   */
  drawerRight?: Snippet;

  /**
   * The header of the layout.
   */
  header?: Snippet;

  /**
   * The footer of the layout.
   */
  footer?: Snippet;
}

export type QLayoutEvents = "resize" | "scroll" | "scrollHeight";
