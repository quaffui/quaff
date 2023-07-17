import { NativePropsDefaults, type NativeProps } from "$lib/utils/types";

export type QTabsVariants = "primary" | "secondary" | "vertical";

export interface QTabsProps extends NativeProps {
  value?: string;

  variant: QTabsVariants;
  round: boolean;
}

export const QTabsPropsDefaults: QTabsProps = {
  value: undefined,

  variant: "primary",
  round: false,

  ...NativePropsDefaults,
};

export interface QTabProps extends NativeProps {
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
