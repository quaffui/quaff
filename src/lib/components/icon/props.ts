import { type NativeProps, NativePropsDefaults } from "$lib/utils/types";

export interface QIconProps extends NativeProps {
  size: "xs" | "sm" | "md" | "lg" | "xl";
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
