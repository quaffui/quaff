import { createAssetsPlugin, CSS_MINIFIER_CONFIG } from "./assets/assetPlugin.js";
import type { QuaffAssetsOptions } from "./assets/assetOptions.js";
import type { Plugin } from "vite";

export type {
  QuaffAssetsOptions,
  QuaffAssetsCssOptions,
  QuaffCssComplexSafelist,
  QuaffCssSafelist,
  QuaffFontsOptions,
  QuaffRobotoFontOptions,
  QuaffIconFontOptions,
  MaterialSymbolStyle,
  RobotoSubset,
  RobotoWeight,
  FontFormat,
  FontDisplay,
} from "./assets/assetOptions.js";

/** Include used Quaff CSS and optimize configured font assets through one source scan. */
export function quaffAssets(options: QuaffAssetsOptions = {}): Plugin {
  return createAssetsPlugin(options);
}

export function createCssMinifierPlugin(): Plugin {
  return {
    name: "quaff:css-minifier",
    config: CSS_MINIFIER_CONFIG,
  };
}
