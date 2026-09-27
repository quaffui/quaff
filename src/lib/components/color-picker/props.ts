import type { QInputProps } from "../input/props";

export type QColorFormat = "hex" | "rgb";

export interface QColorPickerLabels {
  chooseColor: string;
  colorField: string;
  saturation: string;
  brightness: string;
  hue: string;
  opacity: string;
  red: string;
  green: string;
  blue: string;
  format: string;
  apply: string;
  cancel: string;
  invalidColor: string;
}

export interface QColorPickerProps extends Pick<
  QInputProps,
  | "id"
  | "name"
  | "label"
  | "hint"
  | "fillMask"
  | "error"
  | "errorMessage"
  | "dense"
  | "filled"
  | "outlined"
  | "rounded"
  | "class"
  | "style"
  | "tabindex"
  | "aria-label"
  | "aria-describedby"
> {
  /** Selected HEX or RGB color. Only valid edits update this bindable value. */
  value?: string | null;
  /**
   * Shows the picker directly, without a field or popup. Changes apply immediately.
   * The hint, error, errorMessage, mask, fillMask, dense, filled, outlined, rounded and tabindex props apply only to the text field in popup mode.
   */
  inline?: boolean;
  /** Popup visibility. This property is bindable. */
  open?: boolean;
  /** Format emitted by the picker. The editor can switch between HEX and RGB independently. */
  format?: QColorFormat;
  /**
   * HEX mask for the popup mode's text field, independent of the emitted format.
   * Use six HEX positions (for example, \#XXXXXX), or eight to edit opacity with alpha enabled.
   * A six-position mask preserves the current opacity. All positions must be filled to commit.
   */
  mask?: string;
  /** Enables opacity editing and includes alpha in emitted colors. */
  alpha?: boolean;
  /** Prevents interaction and removes the controls from keyboard navigation. */
  disabled?: boolean;
  /** Displays the color without allowing edits. */
  readonly?: boolean;
  /** Overrides the translated control labels and validation message. */
  labels?: Partial<QColorPickerLabels>;
}
