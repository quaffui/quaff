import type { Labelable, Linkable, QSize, StringWithSuggestions, WithActiveAttrs } from "$utils";
import type { MaterialSymbol } from "material-symbols";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QBreadcrumbsGutterOptions = Exclude<QSize, "xs" | "xl">;

export interface QBreadcrumbsProps extends WithActiveAttrs, HTMLAttributes<HTMLElement> {
  /**
   * Color to use for the active breadcrumb element. See <link to colors docs> to see what colors can be used.
   */
  activeColor?: string;
  /**
   * Space around separators.
   */
  gutter?: QBreadcrumbsGutterOptions;
  /**
   * Separator to use between the breadcrumb elements. To use an icon, prefix with "icon:" followed by the name of the icon.
   */
  separator?: StringWithSuggestions<`icon:${MaterialSymbol}`> | Snippet;
  /**
   * Color to use for the separators. See <link to colors docs> to see what colors can be used.
   */
  separatorColor?: string;
}

export interface QBreadcrumbsElProps
  extends Linkable, WithActiveAttrs, Labelable, HTMLAttributes<HTMLLIElement> {
  /**
   * Name of the leading icon for the breadcrumb element. The icon prop overwrites to icon slot.
   */
  icon?: MaterialSymbol | Snippet;
  /**
   * Tag to use for the breadcrumb element.
   */
  tag?: string;
}
