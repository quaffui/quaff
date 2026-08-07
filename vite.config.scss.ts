import { resolve } from "path";
import { defineConfig } from "vite";
import { COMPONENT_CSS } from "./src/lib/internal/componentRegistry.ts";

const componentCss = Object.values(COMPONENT_CSS);

const cssEntries = Object.fromEntries([
  ["index", "src/lib/css/index.scss"],
  ["base", "src/lib/css/base.scss"],
  ...componentCss.map((name) => [name, `src/lib/css/${name}.scss`]),
]) satisfies Record<string, string>;

export default defineConfig({
  resolve: {
    alias: {
      $lib: resolve(import.meta.dirname, "src/lib"),
      $components: resolve(import.meta.dirname, "./src/lib/components"),
      $classes: resolve(import.meta.dirname, "./src/lib/classes"),
      $css: resolve(import.meta.dirname, "./src/lib/css"),
    },
  },
  build: {
    emptyOutDir: false,
    cssMinify: "esbuild",
    rolldownOptions: {
      input: cssEntries,
      output: {
        dir: "dist/css",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
