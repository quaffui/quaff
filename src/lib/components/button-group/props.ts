import type { HTMLAttributes } from "svelte/elements";
import type { QBtnIcon, QBtnSizeOptions, QBtnVariantOptions } from "../button/props";

export interface QBtnGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Uses connected toggle shapes. Baseline groups always use segmented styling. */
  connected?: boolean;
  /** Inherits the global expressive setting when omitted. */
  expressive?: boolean;
  /** Expressive button size. Defaults to sm (40px); baseline groups are always 40px. */
  size?: QBtnSizeOptions;
  /** Default expressive shape for buttons in the group. */
  shape?: "round" | "squared";
  /** Fills the available width. Defaults to true for expressive connected groups, false otherwise. */
  spread?: boolean;
  /** Disables all buttons in the group. */
  disabled?: boolean;
}

export type QBtnToggleValue = string | number;

export interface QBtnToggleOption extends Pick<HTMLAttributes<HTMLElement>, "aria-label"> {
  value: QBtnToggleValue;
  label?: string;
  icon?: QBtnIcon;
  disabled?: boolean;
}

export interface QBtnToggleProps extends Omit<QBtnGroupProps, "children"> {
  /** Options to display. Each value must be unique. */
  options: QBtnToggleOption[];
  /** Selected value, or an array when multiple is enabled. This property is bindable. */
  value?: QBtnToggleValue | QBtnToggleValue[];
  /** Allows selecting multiple options. */
  multiple?: boolean;
  /** Allows clearing the last selection. Defaults to true for multiple selection. */
  clearable?: boolean;
  /** Expressive button style. Defaults to tonal; baseline uses outlined segments. */
  variant?: Exclude<QBtnVariantOptions, "flat">;
}
