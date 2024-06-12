import type { HTMLAttributes, HTMLImgAttributes } from "svelte/elements";

export type IconSizeOptions = Quaff.Size | Quaff.CssValue | number;

export type IconTypeOptions = "outlined" | "sharp" | "rounded";

export interface IconProps extends HTMLAttributes<HTMLElement> {
  /**
   * The size of the icon. Can be specified with CSS units. If no unit is specified, "px" will be used.
   * @default md
   */
  size?: IconSizeOptions;

  /**
   * The type of the icon.
   * @default outlined
   */
  type?: IconTypeOptions;

  /**
   * The name of the Material Symbols icon.
   * @default undefined
   */
  name?: string;

  /**
   * Determines whether the icon should be filled.
   * @default false
   */
  filled?: boolean;

  /**
   * The SVG content for the icon.
   * @default undefined
   */
  svg?: string;

  /**
   * The image source for the icon.
   * @default undefined
   */
  img?: string;

  /**
   * Additional attributes for the image element when using the `img` prop, as for example the "alt" attribute.
   * @default {}
   */
  imgAttributes?: HTMLImgAttributes;

  /**
   * The color of the icon.
   * @default undefined
   */
  color?: string;
}
