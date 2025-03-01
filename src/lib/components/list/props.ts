import type { RouterProps } from "$lib/utils/router";
import type { Snippet } from "svelte";
import type { QSeparatorProps } from "../separator/props";
import type { HTMLAnchorAttributes, HTMLAttributes } from "svelte/elements";

export interface QListProps extends HTMLAttributes<HTMLElement> {
  bordered?: boolean;
  roundedBorders?: boolean;
  dense?: boolean;
  separator?: boolean;
  separatorOptions?: Omit<QSeparatorProps, "vertical">;
  padding?: boolean;
  tag?: string;
}

export interface QItemProps extends RouterProps, HTMLAttributes<HTMLElement> {
  tag?: string;
  active?: boolean;
  clickable?: boolean;
  dense?: boolean;
  noRipple?: boolean;
  tabindex?: HTMLAttributes<HTMLElement>["tabindex"];
  target?: HTMLAnchorAttributes["target"];
}

export type QItemSectionTypes =
  | "thumbnail"
  | "video"
  | "avatar"
  | "toggle"
  | "icon"
  | "trailingIcon"
  | "trailingText"
  | "content";

export interface QItemSectionProps extends HTMLAttributes<HTMLDivElement> {
  type?: QItemSectionTypes;
  headline?: Snippet;
  line1?: Snippet;
  line2?: Snippet;
  line3?: Snippet;
}
