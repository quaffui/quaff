import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type AvatarShapeOptions =
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

export type AvatarSizeOptions = __Quaff__.Size | __Quaff__.CssValue | number;

export interface AvatarProps extends HTMLAttributes<HTMLElement> {
  /**
   * Shape of the avatar.
   *
   * @default "circle"
   */
  shape?: AvatarShapeOptions;
  /**
   * Size of the avatar, can be a custom size using CSS units. If no unit is specified, "px" will be used.
   *
   * @default "md"
   */
  size?: AvatarSizeOptions;
  /**
   * Source of the image to be used as the avatar. Can be a url or a path to a local file.
   *
   * @default undefined
   */
  src?: string;
  /**
   * If set to true, the "src" prop will be used as a video source.
   *
   * @default false
   */
  video?: boolean;
  /**
   * alt property for the image.
   *
   * @default undefined
   */
  alt?: string;
  /**
   * Accessibility controls you might want to add inside the <video> element.
   * For example, you might want to add a <p> tag in case the video player doesn't work.
   *
   * @default undefined
   */
  videoAccessibility?: Snippet;
}
