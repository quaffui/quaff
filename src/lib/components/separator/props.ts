import type { HTMLAttributes } from "svelte/elements";

interface QSeparatorPropsVertical extends HTMLAttributes<HTMLDivElement> {
  spacing?: Q.Size;
  inset?: boolean;
  vertical?: true;
  color?: string;
  size?: string;
  text?: string;
  textAlign?: "top" | "middle" | "bottom";
}

interface QSeparatorPropsHorizontal extends HTMLAttributes<HTMLDivElement> {
  spacing?: Q.Size;
  inset?: boolean;
  vertical?: false;
  color?: string;
  size?: string;
  text?: string;
  textAlign?: "left" | "center" | "right";
}

export type QSeparatorProps = QSeparatorPropsHorizontal | QSeparatorPropsVertical;
