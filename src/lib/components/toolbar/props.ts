import type { NativeProps } from "$lib/utils/types";
import { NativePropsDefaults } from "$lib/utils/types";

export interface QToolbarProps extends NativeProps {
  inset: boolean;
  height: string | number;
}

export const QToolbarPropsDefaults: QToolbarProps = {
  inset: false,
  height: "64px",
  ...NativePropsDefaults,
};
