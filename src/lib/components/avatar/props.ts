import type { QuaffSizes, CSSValue, NativeProps } from "$lib/utils/types";

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

export type QAvatarSizeOptions = QuaffSizes | CSSValue | number;

export interface QAvatarProps extends NativeProps {
  /**
   * Shape of the avatar.
   * @default circle
   */
  shape?: QAvatarShapeOptions;

  /**
   * Size of the avatar, can be a custom size using CSS units. If no unit is specified, "px" will be used.
   * @default md
   */
  size?: QAvatarSizeOptions;

  /**
   * Source of the image to use as the avatar. Can be a url or a path to a local file.
   * @default undefined
   */
  src?: string;

  /**
   * If set to true, will use the "src" prop as a video source.
   * @default false
   */
  video?: boolean;
}
