import type { Snippet } from "svelte";
import type { HTMLButtonAttributes } from "svelte/elements";
import type { QBtnProps, QBtnVariantOptions } from "../button/props";

export interface QSplitBtnProps
  extends
    Omit<HTMLButtonAttributes, "children" | "disabled" | "color">,
    Pick<
      QBtnProps,
      | "disabled"
      | "icon"
      | "loading"
      | "href"
      | "to"
      | "replace"
      | "target"
      | "noRipple"
      | "rippleColor"
    > {
  /** Text for the primary action. Menu content is supplied through children. */
  label?: string;
  /** Button style. Defaults to filled. */
  variant?: Exclude<QBtnVariantOptions, "flat">;
  /** Expressive size, from xs to xl. Defaults to sm (40px minimum height). */
  size?: QBtnProps["size"];
  /** Accessible name for the menu button, such as "More send options". */
  menuLabel: string;
  /** Whether the menu is open. This property is bindable. */
  expanded?: boolean;
  /** Menu content, typically a QList with QItem menu items. */
  children: Snippet;
}
