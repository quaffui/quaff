import path from "path";
import { pathToFileURL } from "url";
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

const root = process.env.QUAFF_RTL_TEST_ROOT;
const { preprocessClasses, preprocessContext } = await import(
  pathToFileURL(path.join(root, "plugins/dist/index.js")).href
);

export default defineConfig({
  plugins: [
    sveltekit({
      preprocess: [preprocessContext(), vitePreprocess(), preprocessClasses("Q")],
      adapter: adapter(),
    }),
    // Match Quaff's CSS build after SvelteKit applies its defaults.
    {
      name: "fixture-css-minifier",
      config: { order: "post", handler: () => ({ build: { cssMinify: "esbuild" } }) },
    },
  ],
  resolve: {
    alias: {
      $lib: path.join(root, "src/lib"),
      $components: path.join(root, "src/lib/components"),
      $css: path.join(root, "src/lib/css"),
    },
  },
  cacheDir: ".vite",
});
