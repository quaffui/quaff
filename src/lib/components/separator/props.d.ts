import type { HTMLAttributes } from "svelte/elements";

interface SeparatorPropsVertical extends HTMLAttributes<HTMLDivElement> {
  spacing?: Quaff.Size;
  inset?: boolean;
  vertical?: true;
  color?: string;
  size?: string;
  text?: string;
  textAlign?: "top" | "middle" | "bottom";
}

interface SeparatorPropsHorizontal extends HTMLAttributes<HTMLDivElement> {
  spacing?: Quaff.Size;
  inset?: boolean;
  vertical?: false;
  color?: string;
  size?: string;
  text?: string;
  textAlign?: "left" | "center" | "right";
}

export type SeparatorProps = SeparatorPropsHorizontal | SeparatorPropsVertical;
