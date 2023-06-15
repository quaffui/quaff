import { NativePropsDefaults, type NativeProps } from "$lib/utils/types";

export type QBreadcrumbsGutterOptions = "none" | "sm" | "md" | "lg";

export interface QBreadcrumbsProps extends NativeProps {
  separator: string;
  gutter: QBreadcrumbsGutterOptions;

  activeColor: string;
  separatorColor: string;
}

export interface QBreadcrumbsElProps extends NativeProps {
  label: string;
  icon?: string;
  tag: string;

  to?: string;
  href?: string;
  activeClass?: string;
}

export const QBreadcrumbsPropsDefaults: QBreadcrumbsProps = {
  separator: "/",
  gutter: "sm",

  activeColor: "primary",
  separatorColor: "outline",

  ...NativePropsDefaults,
};

export const QBreadcrumbsElPropsDefaults: QBreadcrumbsElProps = {
  label: "",
  icon: undefined,
  tag: "div",

  to: undefined,
  href: undefined,
  activeClass: "active",

  ...NativePropsDefaults,
};
