import path from "path";
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { configDefaults, defineConfig } from "vitest/config";
import { preprocessClasses, preprocessContext } from "./plugins/dist/index.js";
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

  plugins.push(
    sveltekit({
      preprocess: [preprocessContext(), vitePreprocess(), preprocessClasses("Q")],
      adapter: adapter({
        pages: "build",
        assets: "build",
        fallback: "404.html",
        precompress: true,
      }),
      prerender: { entries: ["*"] },
    })
  );

  return {
    plugins,
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            include: ["{src,docgen}/**/*.test.ts"],
            exclude: [...configDefaults.exclude, "**/*.{ssr,build,browser}.test.ts"],
          },
        },
        {
          extends: true,
          test: { name: "ssr", include: ["src/**/*.ssr.test.ts"] },
        },
        {
          extends: true,
          test: {
            name: "build",
            include: ["{src,docgen}/**/*.build.test.ts"],
            testTimeout: 60_000,
            hookTimeout: 60_000,
          },
        },
        {
          extends: true,
          // Fixture servers and app builds start in hooks; interactions stay short.
          test: {
            name: "browser",
            include: ["src/**/*.browser.test.ts"],
            testTimeout: 15_000,
            hookTimeout: 90_000,
          },
        },
      ],
    },
    resolve: {
      alias: {
        ...(!shouldOptimizeDocs && {
          "virtual:quaff.css": path.resolve(import.meta.dirname, "./src/dev/docsStyles.ts"),
        }),
        $components: path.resolve(import.meta.dirname, "./src/lib/components"),
        $css: path.resolve(import.meta.dirname, "./src/lib/css"),
      },
    },
  };
});
