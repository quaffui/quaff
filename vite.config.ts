import path from "path";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import versionPlugin from "./src/dev/versionPlugin";
import docgenPlugin from "./src/dev/docgenPlugin";

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
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
