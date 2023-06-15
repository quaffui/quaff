import type { NativeProps } from "$lib/utils/types";
import { NativePropsDefaults } from "$lib/utils/types";

export interface QTooltipProps extends NativeProps {
  position: "top" | "right" | "bottom" | "left";
}

export const QTooltipPropsDefaults: QTooltipProps = {
  position: "bottom",
  ...NativePropsDefaults,
};
