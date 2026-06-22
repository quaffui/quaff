import type { HTMLAttributes, HTMLImgAttributes } from "svelte/elements";
import type { MaterialSymbol } from "material-symbols";

export type QIconSizeOptions = Q.Size | Q.CssValue | number;

export type QIconTypeOptions = "outlined" | "sharp" | "rounded";

export interface QIconProps extends HTMLAttributes<HTMLElement> {
  /**
   * The size of the icon. Can be specified with CSS units. If no unit is specified, "px" will be used.
   * @default md
   */
  size?: QIconSizeOptions;

  /**
   * The type of the icon.
   * @default outlined
   */
  type?: QIconTypeOptions;

  /**
   * The name of the Material Symbols icon.
   */
  name?: MaterialSymbol | `img:${string}`;

  /**
   * Determines whether the icon should be filled.
   * @default false
   */
  filled?: boolean;

  /**
   * The SVG content for the icon.
   */
  svg?: string;

  /**
   * The image source for the icon.
   */
  img?: string;

  /**
   * Additional attributes for the image element when using the `img` prop, as for example the "alt" attribute.
   * @default {}
   */
  imgAttributes?: HTMLImgAttributes;

  /**
   * The color of the icon.
   */
  color?: string;
}
