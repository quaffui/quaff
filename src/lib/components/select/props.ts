import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QSelectOption = string | number | { label: string | number; value: string | number };

export type QSelectValue = QSelectOption | QSelectOption[] | null;

export type QSelectFilterUpdate = (callbackFn: () => void | Promise<void>) => void;

export interface QSelectProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Current value of the select. Can be a single value or an array of values when multiple is true.
   */
  value: QSelectValue;

  /**
   * Enables multiple selection mode.
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
   */
  dense?: boolean;

  /**
   * Disables the select, preventing user interaction.
   */
  disabled?: boolean;

  /**
   * Indicates an error state for the select.
   */
  error?: boolean;

  /**
   * Message to display when the select is in an error state.
   */
  errorMessage?: string;

  /**
   * Applies a filled background style to the select.
   */
  filled?: boolean;

  /**
   * Helper text displayed below the select.
   */
  hint?: string;

  /**
   * Label text for the select field.
   */
  label?: string;

  /**
   * Applies an outlined style to the select.
   */
  outlined?: boolean;

  /**
   * Makes the sides of the select round.
   */
  rounded?: boolean;

  /**
   * Custom text to display in the select instead of the selected value.
   */
  displayValue?: string;

  /**
   * Indicates whether to emit the value rather than the entire option object when a value is selected.
   */
  emitValue?: boolean;

  /**
   * Allows typing into the select field.
   */
  useInput?: boolean;

  /**
   * Filters options by their label while typing. Requires useInput.
   */
  filterable?: boolean;

  /**
   * Delay in milliseconds before calling onFilter after input changes.
   */
  inputDebounce?: number;

  /**
   * Text shown when no options are available.
   */
  noOptionText?: string;

  /**
   * Called while typing so options can be filtered or loaded externally. Requires useInput.
   */
  onFilter?: (
    value: string,
    update: QSelectFilterUpdate,
    abort: () => void
  ) => void | Promise<void>;

  /**
   * Content to be placed before the select wrapper element, usually an icon.
   */
  before?: Snippet;

  /**
   * Content to be placed at the start of the select field, usually an icon.
   */
  prepend?: Snippet;

  /**
   * Content to be placed at the end of the select field, before the dropdown arrow, usually an icon.
   */
  append?: Snippet;

  /**
   * Content to be placed after the select wrapper element, usually an icon.
   */
  after?: Snippet;
}
