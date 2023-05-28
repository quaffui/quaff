import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
      $components: path.resolve("./src/lib/components"),
      $composables: path.resolve("./src/lib/composables"),
      $directives: path.resolve("./src/lib/directives"),
      $utils: path.resolve("./src/lib/utils"),
      $css: path.resolve("./src/lib/css"),
    },
  },
});
