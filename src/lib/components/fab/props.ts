import type { Snippet } from "svelte";
import type { HTMLButtonAttributes } from "svelte/elements";
import type { QBtnIcon, QBtnProps } from "../button/props";

export type QFabSize = "sm" | "md" | "lg";
export type QFabColor =
  | "primary-container"
  | "secondary-container"
  | "tertiary-container"
  | "primary"
  | "secondary"
  | "tertiary"
  | "surface";

interface QFabCommonProps extends Pick<
  QBtnProps,
  "href" | "to" | "replace" | "target" | "noRipple" | "rippleColor"
> {
  /** Uses Material 3 Expressive sizing. Inherits the Quaff.init() setting when omitted. */
  expressive?: boolean;
  /**
   * Size of the FAB. Baseline sizes are 40, 56, and 96px; expressive sizes are 56, 80, and 96px.
   * Defaults to 56px (md for baseline, sm for expressive). Extended FABs use these as minimum heights; the baseline minimum is always 56px.
   */
  size?: QFabSize;
  /** Color role for the container and its matching content. Surface is a legacy color style.
   * @default "primary-container"
   */
  color?: QFabColor;
}

export interface QFabProps
  extends
    QFabCommonProps,
    Omit<HTMLButtonAttributes & Record<"aria-label", string>, "children" | "color" | "disabled"> {
  /** Icon for the primary action. Supply an aria-label to name the action. */
  icon: QBtnIcon;
}

export interface QExtendedFabProps
  extends QFabCommonProps, Omit<HTMLButtonAttributes, "children" | "color" | "disabled"> {
  /** Short, visible text naming the primary action. */
  label: string;
  /** Optional icon for the primary action. */
  icon?: QBtnIcon;
  /** Collapses to an icon-only FAB while preserving the accessible name. Ignored without an icon.
   * @default false
   */
  collapsed?: boolean;
}

export interface QFabMenuProps extends Omit<
  QFabProps,
  | "aria-label"
  | "onclick"
  | "href"
  | "to"
  | "replace"
  | "target"
  | "type"
  | "form"
  | "formaction"
  | "formenctype"
  | "formmethod"
  | "formnovalidate"
  | "formtarget"
  | "name"
  | "value"
> {
  /** Accessible name for the menu trigger, such as "Create content". */
  menuLabel: string;
  /** Whether the menu is open. This property is bindable.
   * @default false
   */
  expanded?: boolean;
  /** Related menu actions, typically a QList with QItem menu items. */
  children: Snippet;
}
