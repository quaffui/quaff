import path from "path";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import docgenPlugin from "./src/dev/docgenPlugin.ts";
import { createCssMinifierPlugin } from "./src/lib/plugins/assets.ts";
import { DOCS_ASSET_OPTIONS } from "./src/dev/docsAssets.ts";
import { createDocsAssetsPlugin } from "./src/dev/docsAssetsPlugin.ts";
import type { PluginOption } from "vite";

export default defineConfig(async ({ command, mode }) => {
  // SvelteKit also loads build config during sync, before dist exists.
  const isDocsDev = command === "serve" && mode !== "test";
  const shouldOptimizeDocs =
    isDocsDev || (mode !== "test" && process.env.QUAFF_DOCS_ASSETS === "true");
  const plugins: PluginOption[] = [docgenPlugin()];

  if (isDocsDev) {
    plugins.push(createDocsAssetsPlugin());
  } else if (shouldOptimizeDocs) {
    // Only the final build:docs command loads the prepared package assets.
    const assetsPluginUrl = new URL("./dist/plugins/assets.js", import.meta.url);
    const { quaffAssets } = await import(assetsPluginUrl.href);
    plugins.push(quaffAssets(DOCS_ASSET_OPTIONS));
  } else {
    const cssMinifierPlugin = createCssMinifierPlugin();
    plugins.push(cssMinifierPlugin);
  }

  plugins.push(sveltekit());

  return {
    plugins,
    test: {
      include: ["src/**/*.{test,spec}.{js,ts}", "docgen/**/*.{test,spec}.{js,ts}"],
    },
    resolve: {
      alias: {
        ...(!shouldOptimizeDocs && {
          "virtual:quaff.css": path.resolve(import.meta.dirname, "./src/dev/docsStyles.ts"),
        }),
        $lib: path.resolve(import.meta.dirname, "./src/lib"),
        $components: path.resolve(import.meta.dirname, "./src/lib/components"),
        $classes: path.resolve(import.meta.dirname, "./src/lib/classes"),
        $composables: path.resolve(import.meta.dirname, "./src/lib/composables"),
        $utils: path.resolve(import.meta.dirname, "./src/lib/utils"),
        $css: path.resolve(import.meta.dirname, "./src/lib/css"),
        $stores: path.resolve(import.meta.dirname, "./src/lib/stores"),
        $helpers: path.resolve(import.meta.dirname, "./src/lib/helpers"),
        $docgen: path.resolve(import.meta.dirname, "./docgen"),
        $internal: path.resolve(import.meta.dirname, "./src/lib/internal"),
        $docs: path.resolve(import.meta.dirname, "./src/docs"),
      },
    },
  };
});
