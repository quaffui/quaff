import type { HTMLAttributes } from "svelte/elements";

export interface CheckboxProps extends HTMLAttributes<HTMLLabelElement> {
  /**
   * Controls the checked state of the checkbox.
   */
  value: boolean;
  /**
   * Sets the label for the checkbox.
   * @default undefined
   */
  label?: string;
  /**
   * Puts the checkbox in a disabled state, making it unclickable.
   * @default false
   */
  disabled?: boolean;
}
