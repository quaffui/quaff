import { resolve } from "path";

export default {
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  resolve: {
    alias: {
      $lib: resolve(__dirname, "src/lib"),
      $components: resolve(__dirname, "./src/lib/components"),
      $css: resolve(__dirname, "./src/lib/css"),
    },
  },
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: "src/lib/css/index.scss",
      output: {
        dir: "dist/css",
        assetFileNames: `[name].[ext]`,
      },
    },
  },
};
