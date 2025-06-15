import type { NativeProps } from "$utils";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QSelectOption = string | { label: string; value: string };

export type QSelectValue = QSelectOption | QSelectOption[];

export interface QSelectProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  /**
   * Current value of the select. Can be a single value or an array of values when multiple is true.
   * This property is bindable.
   */
  value: QSelectValue;

  /**
   * Enables multiple selection mode.
   *
   * @default false
   */
  multiple?: boolean;

  /**
   * Array of options to display in the select menu. Can be an array of strings
   * or objects with label and value properties. If an object is used, the label
   * will be displayed in the dropdown and the value will be used as the selected value.
   */
  options: QSelectOption[];

  /**
   * Makes the select component more compact.
   *
   * @default false
   */
  dense?: boolean;

  /**
   * Disables the select, preventing user interaction.
   *
   * @default false
   */
  disable?: boolean;

  /**
   * Indicates an error state for the select.
   *
   * @default false
   */
  error?: boolean;

  /**
   * Message to display when the select is in an error state.
   *
   * @default undefined
   */
  errorMessage?: string;

  /**
   * Applies a filled background style to the select.
   *
   * @default false
   */
  filled?: boolean;

  /**
   * Helper text displayed below the select.
   *
   * @default undefined
   */
  hint?: string;

  /**
   * Label text for the select field.
   *
   * @default undefined
   */
  label?: string;

  /**
   * Applies an outlined style to the select.
   *
   * @default false
   */
  outlined?: boolean;

  /**
   * Makes the sides of the select round.
   *
   * @default false
   */
  rounded?: boolean;

  /**
   * Custom text to display in the select instead of the selected value.
   *
   * @default undefined
   */
  displayValue?: string;

  /**
   * Indicates whether to emit the value rather than the entire option object when a value is selected.
   *
   * @default false
   */
  emitValue?: boolean;

  /**
   * Content to be placed before the select wrapper element, usually an icon.
   *
   * @default undefined
   */
  before?: Snippet;

  /**
   * Content to be placed at the start of the select field, usually an icon.
   *
   * @default undefined
   */
  prepend?: Snippet;

  /**
   * Content to be placed at the end of the select field, before the dropdown arrow, usually an icon.
   *
   * @default undefined
   */
  append?: Snippet;

  /**
   * Content to be placed after the select wrapper element, usually an icon.
   *
   * @default undefined
   */
  after?: Snippet;
}
