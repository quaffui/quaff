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
      alias: {
        $lib: path.join(root, "src/lib"),
        ...Object.fromEntries(
          [
            "components",
            "classes",
            "composables",
            "utils",
            "css",
            "stores",
            "helpers",
            "internal",
          ].map((name) => [`$${name}`, path.join(root, "src/lib", name)])
        ),
      },
    }),
    // Match Quaff's CSS build after SvelteKit applies its defaults.
    {
      name: "fixture-css-minifier",
      config: { order: "post", handler: () => ({ build: { cssMinify: "esbuild" } }) },
    },
  ],
  cacheDir: ".vite",
});
