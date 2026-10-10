import { PALETTE_COLORS } from "../docs/colorPalette.js";
import type { QuaffAssetsOptions } from "../lib/plugins/assets.js";

const palettePattern = `(?:${PALETTE_COLORS.join("|")})`;

export const DOCS_ASSET_OPTIONS = {
  sourceDir: ["src/routes", "src/docs"],
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
