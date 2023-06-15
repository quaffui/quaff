import { NativePropsDefaults, type NativeProps } from "$lib/utils/types";
import type { QSeparatorProps } from "../separator/props";
import {
  UseRouterLinkPropsDefaults,
  type UseRouterLinkProps,
} from "$lib/composables/use-router-link";

export interface QListProps extends NativeProps {
  bordered: boolean;
  roundedBorders: boolean;
  dense: boolean;
  separator: boolean;
  separatorOptions: {
    spacing?: QSeparatorProps["spacing"];
    inset?: QSeparatorProps["inset"];
    color?: QSeparatorProps["color"];
    size?: QSeparatorProps["size"];
    text?: QSeparatorProps["text"];
    textAlign?: QSeparatorProps["textAlign"];
  };
  padding: boolean;
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

export interface QItemProps extends UseRouterLinkProps, NativeProps {
  tag: string;
  active: boolean;
  clickable: boolean;
  dense: boolean;
  tabindex: string | number;
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

export interface QItemSectionProps extends NativeProps {
  thumbnail: boolean;
  video: boolean;
  icon: boolean;
  avatar: boolean;
}

export const QItemSectionProps: QItemSectionProps = {
  thumbnail: false,
  video: false,
  icon: false,
  avatar: false,
  ...NativePropsDefaults,
};
