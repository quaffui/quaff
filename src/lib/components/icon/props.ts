import type { NativeProps } from "$lib/utils/types";
import { NativePropsDefaults } from "$lib/utils/types";

export interface QIconProps extends NativeProps {
  size: "xs" | "sm" | "md" | "lg" | "xl" | string | number;
  type: "outlined" | "sharp" | "rounded";
  name?: string;
  fill: boolean;
  svg?: string;
  img?: string;
  imgAttributes: Record<string, any>;
  color?: string;
}

export const QIconPropsDefaults: QIconProps = {
  size: "md",
  type: "outlined",
  fill: false,
  svg: undefined,
  img: undefined,
  imgAttributes: {},
  color: undefined,
  ...NativePropsDefaults,
};
