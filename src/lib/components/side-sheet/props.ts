import type { Borderable, OptionalModel } from "$utils";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface QSideSheetProps
  extends OptionalModel<boolean>, Borderable, HTMLAttributes<HTMLDialogElement> {
  /** Blocks interaction with the page until the sheet closes. */
  modal?: boolean;

  /** The sheet heading. Otherwise, provide aria-label or aria-labelledby. */
  headline?: string;

  /** The logical side of the container, mirrored in right-to-left layouts. */
  side?: "start" | "end";

  /** The width, up to 400px. Numbers use pixels; CSS units are also accepted. */
  width?: string | number;

  /** Insets the sheet by 16px and rounds all corners. */
  detached?: boolean;

  /** Accessible label for the close button. */
  closeLabel?: string;

  /** Actions displayed below the content. */
  actions?: Snippet;
}
