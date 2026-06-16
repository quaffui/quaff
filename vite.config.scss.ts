import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      $lib: resolve(__dirname, "src/lib"),
      $components: resolve(__dirname, "./src/lib/components"),
      $css: resolve(__dirname, "./src/lib/css"),
    },
  },
  build: {
    emptyOutDir: false,
    cssMinify: "esbuild",
    rolldownOptions: {
      input: "src/lib/css/index.scss",
      output: {
        dir: "dist/css",
        assetFileNames: `[name].[ext]`,
      },
    },
  },
});
