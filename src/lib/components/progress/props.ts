import { NativePropsDefaults, type NativeProps } from "$utils/types";

export interface QLinearProgressProps extends NativeProps {
  value: number;
  from: "left" | "right";
  rounded: boolean;
}

export interface QCircularProgressProps extends NativeProps {
  value: number;
  indeterminate: boolean;
  size: string | number;
  color?: string;
  thickness: number;
}

export const QLinearProgressPropsDefaults = {
  value: 0,
  from: "left",
  rounded: false,
  ...NativePropsDefaults,
};
