import { type NativeProps, NativePropsDefaults } from "$lib/utils/types";

export interface QToolbarProps extends NativeProps {
  inset: boolean;
}

export const QToolbarPropsDefaults: QToolbarProps = {
  inset: false,
  ...NativePropsDefaults,
};
