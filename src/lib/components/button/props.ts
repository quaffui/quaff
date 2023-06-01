import { UseAlignPropsDefaults, type UseAlignProps } from "$composables/use-align.js";
import { NativePropsDefaults, type NativeProps } from "$utils/types";

export interface QBtnProps extends NativeProps {
  flat: boolean;
  round?: boolean;
  label?: string;
  icon?: string;
  disable?: boolean;
  loading?: boolean;
  unelevated?: boolean;
  outline?: boolean;
}

export const QCardPropsDefaults: QBtnProps = {
  flat: false,
  round: false,
  label: undefined,
  icon: undefined,
  disable: false,
  loading: false,
  unelevated: false,
  ...NativePropsDefaults,
};
