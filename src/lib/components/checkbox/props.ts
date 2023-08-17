import type { NativeProps } from "$lib/utils/types";
import type { HTMLAttributes } from "svelte/elements";

export interface QCheckboxProps extends NativeProps, HTMLAttributes<HTMLLabelElement> {
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
  disable?: boolean;
}
