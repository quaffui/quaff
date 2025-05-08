import type { NativeProps } from "$utils";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

//prettier-ignore
export type QLayoutViewOptions = `${"l"|"h"}${"h"|"H"}${"r"|"h"} ${"l"|"L"}${"p"}${"r"|"R"} ${"l"|"f"}${"f"|"F"}${"r"|"f"}`

export interface QLayoutProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  /**
   * The layout view configuration, which defines how layout components (header, railbars, drawers, footer) should be displayed on screen.
   * See <a href="https://quasar.dev/layout/layout/#understanding-the-view-prop" target="_blank">Quasar's explanation on the view prop</a>.
   * @default "hhh lpr fff"
   */
  view?: QLayoutViewOptions;

  /**
   * Main area of the layout where the content will be displayed, meaning everything besides the layout components (header, railbars, drawers, footer).
   * It overrides the default children snippet.
   * @default undefined
   */
  content?: Snippet;

  /**
   * The railbar on the left side of the layout.
   * @default undefined
   */
  railbarLeft?: Snippet;

  /**
   * The railbar on the right side of the layout.
   * @default undefined
   */
  railbarRight?: Snippet;

  /**
   * The drawer on the left side of the layout.
   * @default undefined
   */
  drawerLeft?: Snippet;

  /**
   * The drawer on the right side of the layout.
   * @default undefined
   */
  drawerRight?: Snippet;

  /**
   * The header of the layout.
   * @default undefined
   */
  header?: Snippet;

  /**
   * The footer of the layout.
   * @default undefined
   */
  footer?: Snippet;
}

export type QLayoutEvents = "resize" | "scroll" | "scrollHeight";
