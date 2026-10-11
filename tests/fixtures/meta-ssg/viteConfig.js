import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter(),
    }),
  ],
  resolve: { alias: { $lib: process.env.QUAFF_META_TEST_LIB } },
  cacheDir: ".vite",
});
