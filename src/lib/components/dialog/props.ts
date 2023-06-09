import { NativeProps, NativePropsDefaults } from "$lib/utils/types";

export interface QDialogProps extends NativeProps {
  value: boolean;
  btnContent: string;

  position: "default" | "top" | "right" | "bottom" | "left";
  modal: boolean;
  fullscreen: boolean;
  persistent: boolean;
}

export const QDialogPropsDefaults: QDialogProps = {
  value: false,
  btnContent: "",

  position: "default",
  modal: false,
  fullscreen: false,
  persistent: false,

  ...NativePropsDefaults,
};
