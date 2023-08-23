import type { NativeProps } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export type QBreadcrumbsGutterOptions = "none" | "sm" | "md" | "lg";

export interface QBreadcrumbsProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  /**
   * Separator to use between the breadcrumb elements. To use an icon, prefix with "icon:" followed by the name of the icon.
   * @default /
   */
  separator?: string;

  /**
   * Space around separators.
   * @default sm
   */
  gutter?: QBreadcrumbsGutterOptions;

  /**
   * Color to use for the active breadcrumb element. See <link to colors docs> to see what colors can be used.
   * @default primary
   */
  activeColor?: string;

  /**
   * Color to use for the separators. See <link to colors docs> to see what colors can be used.
   * @default outline
   */
  separatorColor?: string;
}

export interface QBreadcrumbsElProps extends NativeProps, HTMLAttributes<HTMLElement> {
  /**
   * Text to use for the breadcrumb element. If default slot is defined, the label will be overwritten by it.
   * @default ""
   */
  label?: string;

  /**
   * Name of the leading icon for the breadcrumb element. The icon prop overwrites to icon slot.
   * @default undefined
   */
  icon?: string;

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

  /**
   * Also makes the breadcrumb element navigational. Can be used with the router (e.g to="/home") or as a normal href attribute (e.g to="#section-id")
   * @default undefined
   */
  href?: string;

  /**
   * Class to apply to the breadcrumb element when the route is active.
   * @default "active"
   */
  activeClass?: string;
}
