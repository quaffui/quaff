import path from "path";
import { pathToFileURL } from "url";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const root = process.env.QUAFF_RTL_TEST_ROOT;
const { preprocessClasses, preprocessContext } = await import(
  pathToFileURL(path.join(root, "plugins/dist/index.js")).href
);

export default {
  preprocess: [preprocessContext(), vitePreprocess(), preprocessClasses("Q")],
  kit: {
    adapter: adapter(),
    files: { lib: path.join(root, "src/lib") },
    alias: Object.fromEntries(
      ["components", "classes", "composables", "utils", "css", "stores", "helpers", "internal"].map(
        (name) => [`$${name}`, path.join(root, "src/lib", name)]
      )
    ),
  },
};
