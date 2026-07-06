import type { HTMLAttributes } from "svelte/elements";

export type QRadioValue = string | number | boolean | null;

export interface QRadioProps extends HTMLAttributes<HTMLLabelElement> {
  /**
   * Value associated with this radio button. Used when comparing against the selected value.
   */
  value: QRadioValue;

  /**
   * Text label displayed next to the radio button.
   */
  label?: string;

  /**
   * Bound value that determines if this radio button is selected. This prop is bindable.
   * When using a group of radio buttons, this should be the same variable for all of them.
   */
  selected?: QRadioValue;

  /**
   * When true, prevents user interaction with the radio button.
   */
  disabled?: boolean;
}
