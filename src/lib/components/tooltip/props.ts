import { NativePropsDefaults } from "$lib/utils/types";
import type { NativeProps } from "$lib/utils/types";
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
