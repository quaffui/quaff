import type { NativeProps } from "$utils/types";
import type { HTMLAttributes } from "svelte/elements";

interface QSeparatorPropsVertical extends NativeProps {
  spacing?: "none" | "sm" | "md" | "lg";
  inset?: boolean;
  vertical?: true;
  color?: string;
  size: string;
  text?: string;
  textAlign?: "top" | "middle" | "bottom";
}

interface QSeparatorPropsHorizontal extends NativeProps, HTMLAttributes<HTMLDivElement> {
  spacing?: "none" | "sm" | "md" | "lg";
  inset?: boolean;
  vertical?: false;
  color?: string;
  size?: string;
  text?: string;
  textAlign?: "left" | "center" | "right";
}

export type QSeparatorProps = QSeparatorPropsHorizontal | QSeparatorPropsVertical;

export const QSeparatorPropsDefaults: QSeparatorProps = {
  spacing: "sm",
  inset: false,
  vertical: false,
  color: undefined,
  size: "1px",
  text: undefined,
  textAlign: "center",
};
