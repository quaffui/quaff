import { Disableable, Labelable, OptionalModel } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QCheckboxProps
  extends OptionalModel<boolean>, Labelable, Disableable, HTMLAttributes<HTMLLabelElement> {
  /**
   * Controls the checkbox's independent native indeterminate state. This property is bindable.
   */
  indeterminate?: boolean;

  /**
   * Indicates an error state for the checkbox.
   */
  error?: boolean;
}
