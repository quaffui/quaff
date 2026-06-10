import type { NativeProps } from "$utils";
import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLInputAttributes } from "svelte/elements";
import type { QInputFillMask } from "./mask";

type QInputNativeAttributes = Omit<HTMLInputAttributes, "class" | "style" | "value" | "disabled">;

export interface QInputProps extends NativeProps, QInputNativeAttributes {
  /**
   * Makes the input component more compact.
   *
   * @default false
   */
  dense?: boolean;

  /**
   * Disables the input, preventing user interaction.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Indicates an error state for the input.
   *
   * @default false
   */
  error?: boolean;

  /**
   * Message to display when the input is in an error state. Overrides the hint prop when the input is in an error state.
   *
   * @default undefined
   */
  errorMessage?: string;

  /**
   * Applies a filled background style to the input.
   *
   * @default false
   */
  filled?: boolean;

  /**
   * Helper text displayed below the input. When the input is in an error state, the helper text will be overwritten by the error message.
   *
   * @default undefined
   */
  hint?: string;

  /**
   * Label text for the input field.
   *
   * @default undefined
   */
  label?: string;

  /**
   * Applies an outlined style to the input.
   *
   * @default false
   */
  outlined?: boolean;

  /**
   * Makes the sides of the input round.
   *
   * @default false
   */
  rounded?: boolean;

  /**
   * Applies a mask to text input. Supports tokens (#, S, N, A, a, X, x) and named masks: date, datetime, time, fulltime, phone, card.
   *
   * @default undefined
   */
  mask?: string;

  /**
   * Fills empty mask token positions with underscores, or with the first character of the provided string.
   *
   * @default undefined
   */
  fillMask?: QInputFillMask;

  /**
   * Stores only mask token characters in the bindable value.
   *
   * @default false
   */
  unmaskedValue?: boolean;

  /**
   * Current value of the input field. This property is bindable.
   */
  value: string | number;

  /**
   * Classes applied to the field wrapper.
   *
   * @default undefined
   */
  class?: HTMLAttributes<HTMLDivElement>["class"];

  /**
   * Styles applied to the field wrapper.
   *
   * @default undefined
   */
  style?: HTMLAttributes<HTMLDivElement>["style"];

  /**
   * Content to be placed before the input wrapper element, usually an icon.
   *
   * @default undefined
   */
  before?: Snippet;

  /**
   * Content to be placed at the start of the input field, usually an icon.
   *
   * @default undefined
   */
  prepend?: Snippet;

  /**
   * Content to be placed at the end of the input field, usually an icon.
   *
   * @default undefined
   */
  append?: Snippet;

  /**
   * Content to be placed after the input wrapper element, usually an icon.
   *
   * @default undefined
   */
  after?: Snippet;
}
