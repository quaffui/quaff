import { Disableable, Labelable, OptionalModel } from "$utils";
import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLInputAttributes } from "svelte/elements";
import type { QInputFillMask } from "./mask";

export interface QInputProps
  extends
    OptionalModel<string | number | null>,
    Labelable,
    Disableable,
    Omit<HTMLInputAttributes, "value" | "disabled"> {
  /**
   * Makes the input component more compact.
   */
  dense?: boolean;

  /**
   * Indicates an error state for the input.
   */
  error?: boolean;

  /**
   * Message to display when the input is in an error state. Overrides the hint prop when the input is in an error state.
   *
   */
  errorMessage?: string;

  /**
   * Applies a filled background style to the input.
   */
  filled?: boolean;

  /**
   * Helper text displayed below the input. When the input is in an error state, the helper text will be overwritten by the error message.
   *
   */
  hint?: string;

  /**
   * Applies an outlined style to the input.
   */
  outlined?: boolean;

  /**
   * Makes the sides of the input round.
   */
  rounded?: boolean;

  /**
   * Applies a mask to text input. Supports tokens (#, S, N, A, a, X, x) and named masks: date, datetime, time, fulltime, phone, card.
   *
   */
  mask?: string;

  /**
   * Fills empty mask token positions with underscores, or with the first character of the provided string.
   *
   */
  fillMask?: QInputFillMask;

  /**
   * Stores only mask token characters in the bindable value.
   */
  unmaskedValue?: boolean;

  /**
   * Classes applied to the field wrapper.
   *
   */
  class?: HTMLAttributes<HTMLDivElement>["class"];

  /**
   * Styles applied to the field wrapper.
   *
   */
  style?: HTMLAttributes<HTMLDivElement>["style"];

  /**
   * Content to be placed before the input wrapper element, usually an icon.
   *
   */
  before?: Snippet;

  /**
   * Content to be placed at the start of the input field, usually an icon.
   *
   */
  prepend?: Snippet;

  /**
   * Content to be placed at the end of the input field, usually an icon.
   *
   */
  append?: Snippet;

  /**
   * Content to be placed after the input wrapper element, usually an icon.
   *
   */
  after?: Snippet;
}
