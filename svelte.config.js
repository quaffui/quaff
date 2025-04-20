import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { preprocessClasses } from "./plugins/class-preprocessor/index.js";

const isDocs = process.env.BUILD_DOCS === "true";
const base = isDocs ? "/quaff" : "";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [vitePreprocess(), preprocessClasses("Q")],

  experimental: {
    useVitePreprocess: true,
  },

  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "404.html",
      precompress: true,
    }),

    paths: {
      base: process.argv.includes("dev") ? "" : process.env.BASE_PATH || base,
    },

    prerender: { entries: ["*"] },

    alias: {
      $docgen: "./docgen",
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
