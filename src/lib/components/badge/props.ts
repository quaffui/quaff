import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface QBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Count or short status. Negative numbers display as 0; numbers above 999 as 999+. Keep text to four characters. */
  label?: string | number;
  /** Anchors the badge to the top trailing edge of a positioned icon wrapper. */
  floating?: boolean;
  /** Badge content when label is omitted. Empty content renders a dot. Keep text to four characters. */
  children?: Snippet;
}
