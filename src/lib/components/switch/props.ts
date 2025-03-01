import type { MaterialSymbol } from "material-symbols";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface QSwitchProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Current on/off state of the switch. This property is bindable.
   *
   * @default undefined
   */
  value?: boolean;

  /**
   * Text label to display next to the switch.
   *
   * @default undefined
   */
  label?: string;

  /**
   * Position of the label relative to the switch.
   *
   * @default "right"
   */
  labelPosition?: "left" | "right";

  /**
   * Shows default check/close icons in the switch handle.
   *
   * @default false
   */
  icons?: boolean;

  /**
   * When true, only shows the check icon (when the switch is on).
   *
   * @default false
   */
  showOnlyCheckedIcon?: boolean;

  /**
   * Custom icon to show when the switch is on. Can be a Material Symbol name or a custom snippet.
   *
   * @default "check"
   */
  checkedIcon?: MaterialSymbol | Snippet;

  /**
   * Custom icon to show when the switch is off. Can be a Material Symbol name or a custom snippet.
   *
   * @default "close"
   */
  uncheckedIcon?: MaterialSymbol | Snippet;

  /**
   * Disables the switch, preventing user interaction.
   *
   * @default false
   */
  disabled?: boolean;
}
