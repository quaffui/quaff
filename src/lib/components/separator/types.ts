import { DefaultProps } from "$lib/utils/types";

interface QSeparatorPropsVertical extends DefaultProps {
  spacing: "none" | "sm" | "md" | "lg";
  inset: boolean;
  vertical: true;
  color?: string;
  size: string;
  text?: string;
  textAlign: "top" | "middle" | "bottom";
}

interface QSeparatorPropsHorizontal extends DefaultProps {
  spacing: "none" | "sm" | "md" | "lg";
  inset: boolean;
  vertical: false;
  color?: string;
  size: string;
  text?: string;
  textAlign: "left" | "center" | "right";
}

export type QSeparatorProps = QSeparatorPropsHorizontal | QSeparatorPropsVertical;
