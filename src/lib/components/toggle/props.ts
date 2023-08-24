import { NativePropsDefaults } from "$lib/utils";
import type { NativeProps } from "$lib/utils";

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
