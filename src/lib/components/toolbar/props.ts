import type { NativeProps } from "$lib/utils/types";
import { NativePropsDefaults } from "$lib/utils/types";

export interface QToolbarProps extends NativeProps {
  inset: boolean;
}

export const QToolbarPropsDefaults: QToolbarProps = {
  inset: false,
  ...NativePropsDefaults,
};
