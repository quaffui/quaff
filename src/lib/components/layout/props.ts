import type { NativeProps } from "$lib/utils";
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
   * The height of the header. Can be specified with CSS units. If no unit is specified, "px" will be used.
   * @default 64px
   */
  headerHeight?: string | number;

  /**
   * The height of the footer. Can be specified with CSS units. If no unit is specified, "px" will be used.
   * @default 80px
   */
  footerHeight?: string | number;

  /**
   * The width of the left drawer. Can be specified with CSS units. If no unit is specified, "px" will be used.
   * @default 300px
   */
  leftDrawerWidth?: string | number;

  /**
   * The width of the right drawer. Can be specified with CSS units. If no unit is specified, "px" will be used.
   * @default 300px
   */
  rightDrawerWidth?: string | number;

  /**
   * The width of the left railbar. Can be specified with CSS units. If no unit is specified, "px" will be used.
   * @default 88px
   */
  leftRailbarWidth?: string | number;

  /**
   * The width of the right railbar. Can be specified with CSS units. If no unit is specified, "px" will be used.
   * @default 88px
   */
  rightRailbarWidth?: string | number;

  content?: Snippet;

  railbarLeft?: Snippet;

  railbarRight?: Snippet;

  drawerLeft?: Snippet;

  drawerRight?: Snippet;

  header?: Snippet;

  footer?: Snippet;
}

export type QLayoutEvents = "resize" | "scroll" | "scrollHeight";
