import type { CssSizeable, QSize } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export type QSeparatorInset = boolean | "left" | "right" | "both";

export interface QSeparatorVerticalProps extends CssSizeable {
  /**
   * Spacing around the separator.
   */
  spacing?: QSize;

  /**
   * Insets the separator by 16px from the selected side. `true` is an alias for "both".
   */
  inset?: QSeparatorInset;

  /**
   * Sets the separator orientation to vertical.
   */
  vertical?: true;

  /**
   * Color of the separator line.
   */
  color?: string;

  /**
   * Text to display. Its position on the separator is determined by the textAlign prop.
   */
  text?: string;

  /**
   * Vertical alignment of the text when text prop is used.
   */
  textAlign?: "top" | "middle" | "bottom";
}

export interface QSeparatorHorizontalProps extends CssSizeable {
  /**
   * Spacing around the separator.
   */
  spacing?: QSize;

  /**
   * Insets the separator by 16px from the selected side. `true` is an alias for "both".
   */
  inset?: QSeparatorInset;

  /**
   * Sets the separator orientation to horizontal.
   */
  vertical?: false;

  /**
   * Color of the separator line.
   */
  color?: string;

  /**
   * Text to display. Its position on the separator is determined by the textAlign prop.
   */
  text?: string;

  /**
   * Horizontal alignment of the text when text prop is used.
   */
  textAlign?: "left" | "center" | "right";
}

export type QSeparatorProps = (QSeparatorHorizontalProps | QSeparatorVerticalProps) &
  HTMLAttributes<HTMLDivElement>;
