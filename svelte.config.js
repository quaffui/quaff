import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { preprocessClasses } from "./plugins/class-preprocessor/index.js";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [vitePreprocess(), preprocessClasses("Q")],

  experimental: {
    useVitePreprocess: true,
  },

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    alias: {
      $components: "./src/lib/components",
      $composables: "./src/lib/composables",
      $utils: "./src/lib/utils",
      $css: "./src/lib/css",
      $stores: "./src/lib/stores",
      $helpers: "./src/lib/helpers",
    },
  },
};

export default config;
