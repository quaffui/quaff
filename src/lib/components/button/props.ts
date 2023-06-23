import { NativePropsDefaults, type NativeProps } from "$utils/types";

export interface QBtnProps extends NativeProps {
  disable?: boolean;
  flat?: boolean;
  icon?: string;
  label?: string;
  loading?: boolean;
  outline?: boolean;
  round?: boolean;
  to?: string;
  unelevated?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export const QCardPropsDefaults: QBtnProps = {
  disable: false,
  flat: false,
  icon: undefined,
  label: undefined,
  loading: false,
  outline: false,
  round: false,
  to: undefined,
  unelevated: false,
  size: "md",
  ...NativePropsDefaults,
};
