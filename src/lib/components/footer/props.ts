import { NativePropsDefaults, type NativeProps } from "$lib/utils/types";

export interface QFooterProps extends NativeProps {
  value: boolean;
  bordered: boolean;
  elevated: boolean;
  height?: string | number;
}

export const QFooterPropsDefaults: QFooterProps = {
  value: false,
  bordered: false,
  elevated: false,
  height: undefined,
  ...NativePropsDefaults,
};
