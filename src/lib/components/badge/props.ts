import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface QBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Count or short status. Numbers above 999 display as 999+. Keep text to four characters. */
  label?: string | number;
  /** Anchors the badge to the top trailing edge of a positioned icon wrapper. */
  floating?: boolean;
  /** Badge content when label is omitted. Empty content renders a dot. Keep text to four characters. */
  children?: Snippet;
}
