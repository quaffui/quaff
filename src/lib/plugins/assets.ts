import { AssetPluginRuntime, ASSET_PLUGIN_NAME } from "./assets/assetPluginRuntime.js";
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
  const runtime = new AssetPluginRuntime(options);

  return {
    name: ASSET_PLUGIN_NAME,
    enforce: "pre",
    config: CSS_MINIFIER_CONFIG,
    configResolved: (config) => runtime.configure(config),
    async buildStart() {
      await runtime.initialize((file) => this.addWatchFile(file));
    },
    watchChange: (id, change) => runtime.updateWatchedSource(id, change.event),
    configureServer: (server) => runtime.configureServer(server),
    resolveId: (id) => runtime.resolveImport(id),
    load: (id) => runtime.loadStylesheet(id),
    transform: (code, id) => runtime.injectStylesheetImport(code, id),
    hotUpdate(update) {
      if (this.environment.name !== "client") {
        return;
      }

      return runtime.updateEnvironmentSource(update);
    },
    handleHotUpdate: (update) => runtime.updateLegacySource(update),
  };
}

export function createCssMinifierPlugin(): Plugin {
  return {
    name: "quaff:css-minifier",
    config: CSS_MINIFIER_CONFIG,
  };
}

const CSS_MINIFIER_CONFIG: Plugin["config"] = {
  order: "post",
  handler: () => ({ build: { cssMinify: "esbuild" } }),
};
