import { resolve } from "path";
import { defineConfig } from "vite";
import { ComponentCss } from "./src/lib/internal/componentRegistry";

const componentCss = Object.values(ComponentCss);

const cssEntries = Object.fromEntries([
  ["index", "src/lib/css/index.scss"],
  ["base", "src/lib/css/base.scss"],
  ...componentCss.map((name) => [name, `src/lib/css/${name}.scss`]),
]) satisfies Record<string, string>;

export default defineConfig({
  resolve: {
    alias: {
      $lib: resolve(__dirname, "src/lib"),
      $components: resolve(__dirname, "./src/lib/components"),
      $classes: resolve(__dirname, "./src/lib/classes"),
      $css: resolve(__dirname, "./src/lib/css"),
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
