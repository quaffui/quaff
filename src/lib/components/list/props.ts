import { NativePropsDefaults, type NativeProps } from "$lib/utils/types";
import { type QSeparatorProps } from "../separator/props";

export interface QListProps extends NativeProps {
  bordered: boolean;
  roundedBorders: boolean;
  dense: boolean;
  separator: boolean;
  separatorOptions: {
    spacing?: QSeparatorProps["spacing"];
    inset?: QSeparatorProps["inset"];
    color?: QSeparatorProps["color"];
    size?: QSeparatorProps["size"];
    text?: QSeparatorProps["text"];
    textAlign?: QSeparatorProps["textAlign"];
  };
  padding: boolean;
  tag?: string;
}

export const QListPropsDefaults: QListProps = {
  bordered: false,
  roundedBorders: false,
  dense: false,
  separator: false,
  separatorOptions: {},
  padding: false,
  tag: "div",
  ...NativePropsDefaults,
};
