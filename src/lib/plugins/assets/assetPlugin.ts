import { AssetPluginRuntime, ASSET_PLUGIN_NAME } from "./assetPluginRuntime.js";
import type { QuaffAssetsOptions } from "./assetOptions.js";
import type { CssAssetReader } from "./assetUsageState.js";
import type { Plugin } from "vite";

export const CSS_MINIFIER_CONFIG: Plugin["config"] = {
  order: "post",
  handler: () => ({ build: { cssMinify: "esbuild" } }),
};

/** The docs server supplies source styles without changing the public plugin options. */
export function createAssetsPlugin(
  options: QuaffAssetsOptions,
  readCssFile?: CssAssetReader
): Plugin {
  const runtime = new AssetPluginRuntime(options, readCssFile);

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
