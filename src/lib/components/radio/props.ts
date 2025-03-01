import type { HTMLAttributes } from "svelte/elements";

export interface QRadioProps extends HTMLAttributes<HTMLLabelElement> {
  /**
   * Value associated with this radio button. Used when comparing against the selected value.
   *
   * @default ""
   */
  value: string;

  /**
   * Text label displayed next to the radio button.
   *
   * @default ""
   */
  label?: string;

  /**
   * Bound value that determines if this radio button is selected. This prop is bindable.
   * When using a group of radio buttons, this should be the same variable for all of them.
   *
   * @default undefined
   */
  selected?: unknown;

  /**
   * When true, prevents user interaction with the radio button.
   *
   * @default false
   */
  disable?: boolean;
}
