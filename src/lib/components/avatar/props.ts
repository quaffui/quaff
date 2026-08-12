import type { Sizeable } from "$utils/types/props/design";
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

export interface QAvatarProps extends Sizeable, HTMLAttributes<HTMLElement> {
  /**
   * Shape of the avatar. The default circle follows Material 3; other shapes are Quaff extensions.
   */
  shape?: QAvatarShapeOptions;
  /**
   * Source of the image to be used as the avatar. Can be a url or a path to a local file.
   *
   * If the "video" prop is set to true, this will be used as an MP4 video source. If you want to use a different video format, use the "sources" prop.
   */
  src?: string;
  /**
   * Only for video avatars. Use this prop to specify multiple sources for the video. The browser will play the first source it can support. This overrides the "src" prop.
   *
   * If used while the "video" prop is set to false, this prop has no effect.
   */
  sources?: QAvatarVideoSrcOptions[];
  /**
   * If set to true, the avatar will be treated as a video avatar.
   * This means that the "src" prop will be used as an MP4 video source and the "sources" prop can be used to specify multiple sources for the video.
   */
  video?: boolean;
  /**
   * Pauses a video avatar. Bind this property to provide a play/pause control.
   * Set it to true to prevent autoplay. Defaults to false; has no effect on images.
   */
  paused?: boolean;
  /**
   * Image alternative text. Defaults to an empty string for decorative images.
   * Provide a description when the image conveys information not already present in nearby text.
   */
  alt?: string;
  /**
   * Content inside the &lt;video&gt; element, such as caption tracks, additional sources or fallback text.
   * Use the paused binding for playback controls outside the video.
   */
  videoAccessibility?: Snippet;
}
