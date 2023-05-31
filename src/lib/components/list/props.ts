import { QSeparatorProps } from "../separator/props";

export interface QListProps {
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

export const QListDefaultProps: QListProps = {
  bordered: false,
  roundedBorders: false,
  dense: false,
  separator: false,
  separatorOptions: {},
  padding: false,
  tag: "div",
};
