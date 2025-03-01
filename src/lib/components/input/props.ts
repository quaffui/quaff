import type { NativeProps } from "$lib/utils";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface QInputProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
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
  disable?: boolean;

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
   * Current value of the input field. This property is bindable.
   */
  value: string;

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
