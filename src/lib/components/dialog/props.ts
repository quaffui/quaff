import { NativeProps, NativePropsDefaults } from "$lib/utils/types";
import type { QBtnProps } from "../button/props";

export interface QDialogProps extends NativeProps {
  value: boolean;
  btnContent: string;
  btnAttrs: QBtnProps;

  position: "default" | "top" | "right" | "bottom" | "left";
  modal: boolean;
  fullscreen: boolean;
  persistent: boolean;
}

export const QDialogPropsDefaults: QDialogProps = {
  value: false,
  btnContent: "",
  btnAttrs: {},

  position: "default",
  modal: false,
  fullscreen: false,
  persistent: false,

  ...NativePropsDefaults,
};
