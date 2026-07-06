import { Disableable, Labelable, OptionalModel } from "$utils";
import type { MaterialSymbol } from "material-symbols";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface QSwitchProps
  extends OptionalModel<boolean>, Labelable, Disableable, HTMLAttributes<HTMLDivElement> {
  /**
   * Position of the label relative to the switch.
   */
  labelPosition?: "left" | "right";

  /**
   * Shows default check/close icons in the switch handle.
   */
  icons?: boolean;

  /**
   * When true, only shows the check icon (when the switch is on).
   */
  showOnlyCheckedIcon?: boolean;

  /**
   * Custom icon to show when the switch is on. Can be a Material Symbol name or a custom snippet.
   */
  checkedIcon?: MaterialSymbol | Snippet;

  /**
   * Custom icon to show when the switch is off. Can be a Material Symbol name or a custom snippet.
   */
  uncheckedIcon?: MaterialSymbol | Snippet;
}
