import { NativePropsDefaults, type NativeProps } from "$lib/utils/types";

export interface QTabsProps extends NativeProps {
  value?: string;

  vertical: boolean;
  round: boolean;
  smallIndicator: boolean;
}

export const QTabsPropsDefaults: QTabsProps = {
  value: undefined,

  vertical: false,
  round: false,
  smallIndicator: false,

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