import { NativePropsDefaults, type NativeProps } from "$lib/utils/types";

export interface QDrawerProps extends NativeProps {
  value: boolean;
  side: "left" | "right";
  railbar: boolean;

  width: number | string;

  mini: boolean;
  miniToOverlay: boolean;
  miniWidth: number | string;
  noMiniAnimation: boolean;

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
  railbar: false,

  width: 300,

  mini: false,
  miniToOverlay: false,
  miniWidth: 88,
  noMiniAnimation: false,

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
