import path from "path";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import docgenPlugin from "./src/dev/docgenPlugin.ts";
import { quaffCssMinifier } from "./src/lib/plugins/css.ts";

export default defineConfig({
  plugins: [docgenPlugin(), sveltekit(), quaffCssMinifier()],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}", "docgen/**/*.{test,spec}.{js,ts}"],
  },
  resolve: {
    alias: {
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
});
