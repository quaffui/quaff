import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QAvatarShapeOptions =
  | "circle"
  | "square"
  | "top-round"
  | "left-round"
  | "right-round"
  | "bottom-round"
  | "top-left-round"
  | "top-right-round"
  | "bottom-left-round"
  | "bottom-right-round";

export type QAvatarSizeOptions = Q.Size | Q.CssValue | number;

export type VideoTypes =
  | "video/mp4"
  | "video/webm"
  | "video/ogg"
  | "video/quicktime"
  | "video/mpeg"
  | "video/3gpp"
  | "video/3gpp2"
  | "video/3gp2";

export type QAvatarVideoSrcOptions = {
  /**
   * Sets the URL of the media resource.
   */
  src: string;
  /**
   * Sets the MIME type of a media resource.
   */
  type: VideoTypes;
};

export interface QAvatarProps extends HTMLAttributes<HTMLElement> {
  /**
   * Shape of the avatar.
   *
   * @default "circle"
   */
  shape?: QAvatarShapeOptions;
  /**
   * Size of the avatar, can be a custom size using CSS units. If no unit is specified, "px" will be used.
   *
   * @default "md"
   */
  size?: QAvatarSizeOptions;
  /**
   * Source of the image to be used as the avatar. Can be a url or a path to a local file.
   *
   * If the "video" prop is set to true, this will be used as an MP4 video source. If you want to use a different video format, use the "sources" prop.
   *
   * @default undefined
   */
  src?: string;
  /**
   * Only for video avatars. Use this prop to specify multiple sources for the video. The browser will play the first source it can support. This overrides the "src" prop.
   *
   * If used while the "video" prop is set to false, this prop has no effect.
   *
   * @default undefined
   */
  sources?: QAvatarVideoSrcOptions[];
  /**
   * If set to true, the avatar will be treaded as a video avatar.
   * This means that the "src" prop will be used as an MP4 video source and the "sources" prop can be used to specify multiple sources for the video.
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
   * This can also be use to add captions or subtitles to the video or even to add the sources manually (without using the "src" or "sources" props).
   *
   * This snippet will be added inside the <video> tag.
   *
   * @default undefined
   */
  videoAccessibility?: Snippet;
}
