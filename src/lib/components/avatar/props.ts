import type { QuaffSizes, CssValue, NativeProps } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";

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

export type QAvatarSizeOptions = QuaffSizes | CssValue | number;

export interface QAvatarProps extends NativeProps, HTMLAttributes<HTMLElement> {
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
