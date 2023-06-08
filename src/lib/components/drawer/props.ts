import { NativePropsDefaults, type NativeProps } from "$lib/utils/types";

export interface QDrawerProps extends NativeProps {
  value: boolean;
  side: "left" | "right";

  width: number | string;

  breakpoint: number;
  showIfAbove: boolean;

  behavior: "default" | "desktop" | "mobile";

  bordered: boolean;
  elevated: boolean;

  overlay: boolean;
  persistent: boolean;
  noSwipeOpen: boolean;
  noSwipeClose: boolean;
  noSwipeBackdrop: boolean;
}

export const QDrawerPropsDefaults: QDrawerProps = {
  value: false,
  side: "left",

  width: 300,

  breakpoint: 1023,
  showIfAbove: false,

  behavior: "default",

  bordered: false,
  elevated: false,

  overlay: false,
  persistent: false,
  noSwipeOpen: false,
  noSwipeClose: false,
  noSwipeBackdrop: false,
  ...NativePropsDefaults,
};
