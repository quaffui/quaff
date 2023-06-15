import type { NativeProps } from "$lib/utils/types";
import { NativePropsDefaults } from "$lib/utils/types";

export type QAvatarShapeOptions =
  | "circle"
  | "rounded"
  | "top-round"
  | "left-round"
  | "right-round"
  | "bottom-round"
  | "top-left-round"
  | "top-right-round"
  | "bottom-left-round"
  | "bottom-right-round";

export type QAvatarSizeOptions = "xs" | "sm" | "md" | "lg" | "xl" | string;

export interface QAvatarProps extends NativeProps {
  shape: QAvatarShapeOptions;
  size: QAvatarSizeOptions;
  src?: string;
  video: boolean;
}

export const QAvatarPropsDefault = {
  shape: "circle",
  size: "md",
  video: false,
  ...NativePropsDefaults,
};
