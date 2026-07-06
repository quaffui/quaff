import type { CssValue, QSize, Sizeable } from "$utils";
import type { HTMLAttributes, HTMLImgAttributes } from "svelte/elements";
import type { MaterialSymbol } from "material-symbols";

export type QIconSizeOptions = QSize | CssValue | number;

export type QIconTypeOptions = "outlined" | "sharp" | "rounded";

export interface QIconProps extends Sizeable, HTMLAttributes<HTMLElement> {
  /**
   * The type of the icon.
   */
  type?: QIconTypeOptions;

  /**
   * The name of the Material Symbols icon.
   */
  name?: MaterialSymbol | `img:${string}`;

  /**
   * Determines whether the icon should be filled.
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
   */
  imgAttributes?: HTMLImgAttributes;

  /**
   * The color of the icon.
   */
  color?: string;
}
