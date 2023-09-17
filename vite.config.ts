import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import versionPlugin from "./src/dev/version-plugin";
import docgenPlugin from "./src/dev/docgen-plugin";
import path from "path";

export default defineConfig({
  plugins: [versionPlugin(), docgenPlugin(), sveltekit()],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "./src/lib"),
      $components: path.resolve(__dirname, "./src/lib/components"),
      $composables: path.resolve(__dirname, "./src/lib/composables"),
      $utils: path.resolve(__dirname, "./src/lib/utils"),
      $css: path.resolve(__dirname, "./src/lib/css"),
      $stores: path.resolve(__dirname, "./src/lib/stores"),
      $helpers: path.resolve(__dirname, "./src/lib/helpers"),
    },
  },
});
