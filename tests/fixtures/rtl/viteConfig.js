import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit(),
    // Match Quaff's CSS build after SvelteKit applies its defaults.
    {
      name: "fixture-css-minifier",
      config: { order: "post", handler: () => ({ build: { cssMinify: "esbuild" } }) },
    },
  ],
  cacheDir: ".vite",
});
