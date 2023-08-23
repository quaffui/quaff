import { NativePropsDefaults, type NativeProps } from "$utils";
import type { HTMLAttributes } from "svelte/elements";

export type QTabsVariants = "primary" | "secondary" | "vertical";

export interface QTabsProps extends NativeProps, HTMLAttributes<HTMLElement> {
  value?: string;
  variant?: QTabsVariants;
  round?: boolean;
}

export const QTabsPropsDefaults: QTabsProps = {
  value: undefined,
  variant: "primary",
  round: false,
  ...NativePropsDefaults,
};

export interface QTabProps extends NativeProps, HTMLAttributes<HTMLElement> {
  name?: string;
  to?: string;
  icon?: string;
}

export const QTabPropsDefaults: QTabProps = {
  name: undefined,
  to: undefined,
  icon: undefined,
  ...NativePropsDefaults,
};
