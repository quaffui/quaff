import type { MaterialSymbol } from "material-symbols";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QBreadcrumbsGutterOptions = Exclude<Q.Size, "xs" | "xl">;

export interface QBreadcrumbsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Color to use for the active breadcrumb element. See <link to colors docs> to see what colors can be used.
   * @default "primary"
   */
  activeColor?: string;
  /**
   * Space around separators.
   * @default "sm"
   */
  gutter?: QBreadcrumbsGutterOptions;
  /**
   * Separator to use between the breadcrumb elements. To use an icon, prefix with "icon:" followed by the name of the icon.
   * @default "/"
   */
  separator?: string | `icon:${MaterialSymbol}` | Snippet;
  /**
   * Color to use for the separators. See <link to colors docs> to see what colors can be used.
   * @default "outline"
   */
  separatorColor?: string;
}

export interface QBreadcrumbsElProps extends HTMLAttributes<HTMLElement> {
  /**
   * Class to apply to the breadcrumb element when the route is active.
   * @default "active"
   */
  activeClass?: string;
  /**
   * Name of the leading icon for the breadcrumb element. The icon prop overwrites to icon slot.
   * @default undefined
   */
  icon?: MaterialSymbol | Snippet;
  /**
   * Text to use for the breadcrumb element. If default slot is defined, the label will be overwritten by it.
   * @default ""
   */
  label?: string;
  /**
   * Also makes the breadcrumb element navigational. Can be used with the router (e.g to="/home") or as a normal href attribute (e.g to="#section-id")
   * @default undefined
   */
  href?: string;
  /**
   * Tag to use for the breadcrumb element.
   * @default "div"
   */
  tag?: string;
  /**
   * Makes the breadcrumb element navigational. Can be used with the router (e.g to="/home") or as a normal href attribute (e.g to="#section-id")
   * @default undefined
   */
  to?: string;
}
