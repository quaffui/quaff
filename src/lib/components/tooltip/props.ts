import { type NativeProps, NativePropsDefaults } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QTooltipProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  value?: boolean;
  position?: "top" | "right" | "bottom" | "left";
}

export const QTooltipPropsDefaults: QTooltipProps = {
  value: undefined,
  position: "bottom",
  ...NativePropsDefaults,
};
