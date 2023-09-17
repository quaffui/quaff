import { NativePropsDefaults } from "$lib/utils";
import { UseRouterLinkPropsDefaults } from "$lib/composables/useRouterLink";
import type { UseRouterLinkProps } from "$lib/composables/useRouterLink";
import type { QSeparatorProps } from "../separator/props";
import type { HTMLAnchorAttributes, HTMLAttributes } from "svelte/elements";
import type { NativeProps } from "$lib/utils";

export interface QListProps extends NativeProps, HTMLAttributes<HTMLElement> {
  bordered?: boolean;
  roundedBorders?: boolean;
  dense?: boolean;
  separator?: boolean;
  separatorOptions?: {
    spacing?: QSeparatorProps["spacing"];
    inset?: QSeparatorProps["inset"];
    color?: QSeparatorProps["color"];
    size?: QSeparatorProps["size"];
    text?: QSeparatorProps["text"];
    textAlign?: QSeparatorProps["textAlign"];
  };
  padding?: boolean;
  tag?: string;
}

export const QListPropsDefaults: QListProps = {
  bordered: false,
  roundedBorders: false,
  dense: false,
  separator: false,
  separatorOptions: {},
  padding: false,
  tag: "div",
  ...NativePropsDefaults,
};

export interface QItemProps extends UseRouterLinkProps, NativeProps, HTMLAttributes<HTMLElement> {
  tag?: string;
  active?: boolean;
  clickable?: boolean;
  dense?: boolean;
  noRipple?: boolean;
  tabindex?: HTMLAttributes<HTMLElement>["tabindex"];
  target?: HTMLAnchorAttributes["target"];
}

export const QItemPropsDefaults: QItemProps = {
  tag: "div",
  active: false,
  clickable: false,
  dense: false,
  tabindex: 0,
  ...UseRouterLinkPropsDefaults,
  ...NativePropsDefaults,
};

export type QItemSectionTypes =
  | "thumbnail"
  | "video"
  | "avatar"
  | "toggle"
  | "icon"
  | "trailingIcon"
  | "trailingText"
  | "content";

export interface QItemSectionProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  type?: QItemSectionTypes;
}

export const QItemSectionPropsDefaults: QItemSectionProps = {
  type: "content",
  ...NativePropsDefaults,
};
