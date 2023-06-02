import { type NativeProps, NativePropsDefaults } from "$lib/utils/types";

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

export interface QAvatarProps extends NativeProps {
  shape: QAvatarShapeOptions;
  size: "xs" | "sm" | "md" | "lg" | "xl" | string;
  src: string;
  video: boolean;
}

export const QAvatarPropsDefault = {
  shape: "circle",
  size: "md",
  src: "https://placehold.co/40",
  video: false,
  ...NativePropsDefaults,
};
