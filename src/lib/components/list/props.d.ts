import type { RouterProps } from "$lib/utils/router";
import type { Snippet } from "svelte";
import type { SeparatorProps } from "../separator/props";
import type { HTMLAnchorAttributes, HTMLAttributes } from "svelte/elements";

export interface ListProps extends HTMLAttributes<HTMLElement> {
  bordered?: boolean;
  roundedBorders?: boolean;
  dense?: boolean;
  separator?: boolean;
  separatorOptions?: {
    spacing?: SeparatorProps["spacing"];
    inset?: SeparatorProps["inset"];
    color?: SeparatorProps["color"];
    size?: SeparatorProps["size"];
    text?: SeparatorProps["text"];
    textAlign?: SeparatorProps["textAlign"];
  };
  padding?: boolean;
  tag?: string;
}

export interface ItemProps extends RouterProps, HTMLAttributes<HTMLElement> {
  tag?: string;
  active?: boolean;
  clickable?: boolean;
  dense?: boolean;
  noRipple?: boolean;
  tabindex?: HTMLAttributes<HTMLElement>["tabindex"];
  target?: HTMLAnchorAttributes["target"];
}

export type ItemSectionTypes =
  | "thumbnail"
  | "video"
  | "avatar"
  | "toggle"
  | "icon"
  | "trailingIcon"
  | "trailingText"
  | "content";

export interface ItemSectionProps extends HTMLAttributes<HTMLDivElement> {
  type?: ItemSectionTypes;
  headline?: Snippet,
  line1?: Snippet,
  line2?: Snippet,
  line3?: Snippet,
}