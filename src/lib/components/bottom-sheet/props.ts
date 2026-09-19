import type { OptionalModel } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QBottomSheetProps extends OptionalModel<boolean>, HTMLAttributes<HTMLElement> {
  /** Blocks interaction with the page and adds a dismissible scrim. */
  modal?: boolean;

  /** Expands the sheet to its available height. */
  expanded?: boolean;

  /** Accessible label for expanding the sheet. */
  expandLabel?: string;

  /** Accessible label for collapsing the sheet. */
  collapseLabel?: string;
}
