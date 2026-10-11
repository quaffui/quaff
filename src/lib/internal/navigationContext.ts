import { QContext } from "#utils/context.js";

export const navigationCtx = QContext<"drawer" | "bar" | "rail">("QNavigation");
