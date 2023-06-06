import { type NativeProps } from "$lib/utils/types";

export interface QLayoutProps extends NativeProps {
  //prettier-ignore
  view: `${"l"|"h"}${"h"|"H"}${"r"|"h"} ${"l"|"L"}${"p"}${"r"|"R"} ${"l"|"f"}${"f"|"F"}${"r"|"f"}`,
  leftDrawerWidth?: string | number;
  rightDrawerWidth?: string | number;
}

export const QLayoutPropsDefaults: QLayoutProps = {
  view: "hhh lpr fff",
  leftDrawerWidth: "300px",
  rightDrawerWidth: "300px",
};

export type QLayoutEvents = "resize" | "scroll" | "scrollHeight";
