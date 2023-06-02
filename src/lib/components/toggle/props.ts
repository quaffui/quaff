import { NativePropsDefaults, type NativeProps } from "$utils/types";

export interface QToggleProps extends NativeProps {
  value?: boolean;
  label?: string;
  leftLabel?: boolean;
  icon?: string;
  disable?: boolean;
}

export const QTogglePropsDefaults: QToggleProps = {
  value: false,
  label: undefined,
  leftLabel: false,
  icon: undefined,
  disable: false,
  ...NativePropsDefaults,
};
