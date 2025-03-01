import type { HTMLAttributes } from "svelte/elements";

export interface QSeparatorVerticalProps {
  /**
   * Spacing around the separator.
   *
   * @default "none"
   */
  spacing?: Q.Size;

  /**
   * Adds horizontal padding to the separator container, adding space around the separator.
   *
   * @default false
   */
  inset?: boolean;

  /**
   * Sets the separator orientation to vertical.
   *
   * @default undefined
   */
  vertical?: true;

  /**
   * Color of the separator line.
   *
   * @default "outline"
   */
  color?: string;

  /**
   * Custom size (thickness) of the separator line.
   *
   * @default undefined
   */
  size?: string;

  /**
   * Text to display. Its position on the separator is determined by the textAlign prop.
   *
   * @default undefined
   */
  text?: string;

  /**
   * Vertical alignment of the text when text prop is used.
   *
   * @default "middle"
   */
  textAlign?: "top" | "middle" | "bottom";
}

export interface QSeparatorHorizontalProps {
  /**
   * Spacing around the separator.
   *
   * @default "none"
   */
  spacing?: Q.Size;

  /**
   * Adds vertical padding to the separator container, adding space around the separator.
   *
   * @default false
   */
  inset?: boolean;

  /**
   * Sets the separator orientation to horizontal.
   *
   * @default undefined
   */
  vertical?: false;

  /**
   * Color of the separator line.
   *
   * @default "outline"
   */
  color?: string;

  /**
   * Custom size (thickness) of the separator line.
   *
   * @default undefined
   */
  size?: string;

  /**
   * Text to display. Its position on the separator is determined by the textAlign prop.
   *
   * @default undefined
   */
  text?: string;

  /**
   * Horizontal alignment of the text when text prop is used.
   *
   * @default "center"
   */
  textAlign?: "left" | "center" | "right";
}

export type QSeparatorProps = (QSeparatorHorizontalProps | QSeparatorVerticalProps) &
  HTMLAttributes<HTMLDivElement>;
