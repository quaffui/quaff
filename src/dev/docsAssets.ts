import { PALETTE_COLORS } from "../docs/colorPalette.js";
import type { QuaffAssetsOptions } from "../lib/plugins/assets.js";

const palettePattern = `(?:${PALETTE_COLORS.join("|")})`;

export const DOCS_ASSET_OPTIONS = {
  sourceDir: ["src/routes", "src/docs"],
  // Generated snippets display the same examples already scanned in their Svelte pages.
  sourceExclude: [
    "**/docs.snippets.ts",
    "**/*.{test,spec}.{js,ts}",
    // The sitemap only lists route URLs; it never renders the matched components.
    "src/routes/sitemap.xml/+server.ts",
  ],
  css: {
    stripUnused: true,
    safelist: [
      // API headings come from generated component docs outside the source scan.
      "q-mr-xs",
      // The colors page builds palette class names at runtime.
      new RegExp(`^bg-${palettePattern}(?:-(?:[1-9]|10))?$`),
      new RegExp(`^text-${palettePattern}-(?:1|10)$`),
      // The grid page builds gutter classes from its size selector.
      /^q-gutter-(?:none|xs|sm|md|lg|xl)$/,
    ],
  },
  fonts: {
    roboto: { formats: ["woff2"] },
    icons: {
      stripUnused: true,
      // Current names are detected in source; add external or generated names here.
      safelist: [],
    },
  },
} satisfies QuaffAssetsOptions;
