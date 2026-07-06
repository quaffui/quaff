import { Disableable, Labelable, OptionalModel } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QCheckboxProps
  extends OptionalModel<boolean>, Labelable, Disableable, HTMLAttributes<HTMLLabelElement> {}
