import type { HTMLAttributes } from "svelte/elements";

export interface QSeparatorVerticalProps {
  spacing?: Q.Size;
  inset?: boolean;
  vertical?: true;
  color?: string;
  size?: string;
  text?: string;
  textAlign?: "top" | "middle" | "bottom";
}

export interface QSeparatorHorizontalProps {
  spacing?: Q.Size;
  inset?: boolean;
  vertical?: false;
  color?: string;
  size?: string;
  text?: string;
  textAlign?: "left" | "center" | "right";
}

export type QSeparatorProps = (QSeparatorHorizontalProps | QSeparatorVerticalProps) &
  HTMLAttributes<HTMLDivElement>;
