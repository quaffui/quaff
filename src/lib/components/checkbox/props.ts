import { NativePropsDefaults, type NativeProps } from "$utils/types";

export interface QCheckboxProps extends NativeProps {
  value: boolean;
  label?: string;
  disable?: boolean;
}

export const QCheckboxPropsDefaults: QCheckboxProps = {
  value: false,
  label: "",
  disable: false,
  ...NativePropsDefaults,
};
