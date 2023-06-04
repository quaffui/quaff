import { type NativeProps } from "$lib/utils/types";

export interface QLayoutProps extends NativeProps {
  //prettier-ignore
  view: `${"l"|"h"}${"h"|"H"}${"r"|"h"} ${"l"|"L"}${"p"}${"r"|"R"} ${"l"|"f"}${"f"|"F"}${"r"|"f"}`
}

export const QLayoutPropsDefaults: QLayoutProps = {
  view: "hhh lpr fff",
};

export type QLayoutEvents = "resize" | "scroll" | "scrollHeight";
