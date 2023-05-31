import { NativePropsDefaults, type NativeProps } from "$utils/types";

export interface QCheckboxProps extends NativeProps {
  value: boolean;
  label: string;
}

export const QCheckboxPropsDefaults: QCheckboxProps = {
  value: false,
  label: "",
  ...NativePropsDefaults,
};
