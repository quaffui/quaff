import { type NativeProps, NativePropsDefaults } from "$lib/utils/types";

export interface QTooltipProps extends NativeProps {
  position: "top" | "right" | "bottom" | "left";
}

export const QTooltipPropsDefaults: QTooltipProps = {
  position: "bottom",
  ...NativePropsDefaults,
};
