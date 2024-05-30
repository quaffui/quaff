import { MaterialSymbol } from "material-symbols";
import { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface QSwitchProps extends HTMLAttributes<HTMLDivElement> {
  value?: boolean;
  label?: string;
  labelPosition?: "left" | "right";
  icons?: boolean;
  showOnlyCheckedIcon?: boolean;
  checkedIcon?: MaterialSymbol | Snippet;
  uncheckedIcon?: MaterialSymbol | Snippet;
  disabled?: boolean;
}
