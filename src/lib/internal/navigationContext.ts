import { QContext } from "$utils/context";

export const navigationCtx = QContext<"drawer" | "bar">("QNavigation");
