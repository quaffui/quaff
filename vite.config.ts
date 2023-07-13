import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import beercssScssPlugin from "./src/dev/beercss-scss-plugin";

const file = fileURLToPath(new URL("package.json", import.meta.url));
const json = readFileSync(file, "utf8");
const pkg = JSON.parse(json);

export default defineConfig({
  plugins: [beercssScssPlugin(), sveltekit()],
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
      $beercss: path.resolve(__dirname, "./src/lib/css/beer.min.lib.scss"),
      $stores: path.resolve(__dirname, "./src/lib/stores"),
      $helpers: path.resolve(__dirname, "./src/lib/helpers"),
    },
  },
  define: {
    __QUAFF_VERSION__: JSON.stringify(pkg.version),
  },
});
