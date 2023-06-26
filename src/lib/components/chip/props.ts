import { NativePropsDefaults, type NativeProps } from "$lib/utils/types";

export interface QChipProps extends NativeProps {
  content?: string;
  icon?: string;
  iconRight?: string;

  disable: boolean;
  responsive: boolean;
  vertical: boolean;
  round: boolean;
  outlined: boolean;
  size: "small" | "medium" | "large";

  tabindex?: string | number;
  href?: string;
}

export const QChipPropsDefaults: QChipProps = {
  content: undefined,
  icon: undefined,
  iconRight: undefined,

  disable: false,
  responsive: false,
  vertical: false,
  round: false,
  outlined: false,
  size: "medium",

  tabindex: undefined,
  href: undefined,

  ...NativePropsDefaults,
};
