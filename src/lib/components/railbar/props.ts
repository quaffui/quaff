import { NativePropsDefaults, type NativeProps } from "$lib/utils/types";

export interface QRailbarProps extends NativeProps {
  width: number | string;
  side: "left" | "right";
  bordered: boolean;
}

export const QRailbarPropsDefaults: QRailbarProps = {
  width: 88,
  side: "left",
  bordered: false,
  ...NativePropsDefaults,
};
