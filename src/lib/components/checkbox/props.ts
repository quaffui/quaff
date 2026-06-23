import type { HTMLAttributes } from "svelte/elements";

export interface QCheckboxProps extends HTMLAttributes<HTMLLabelElement> {
  /**
   * Controls the checked state of the checkbox.
   *
   * @bindable
   */
  value: boolean;
  /**
   * Sets the label for the checkbox.
   */
  label?: string;
  /**
   * Puts the checkbox in a disabled state, making it unclickable.
   * @default false
   */
  disabled?: boolean;
}
