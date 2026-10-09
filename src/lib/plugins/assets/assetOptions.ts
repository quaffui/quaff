import type {
  ComponentName,
  UTILITY_COMPONENT_DEPENDENCIES,
} from "../../internal/componentRegistry.js";

type CssExportName = ComponentName | keyof typeof UTILITY_COMPONENT_DEPENDENCIES;
type SafelistValue = RegExp | string;
type DevelopmentCssMode = "exact" | "full";

export type FontFormat = "woff2" | "woff";
export type FontDisplay = "auto" | "block" | "swap" | "fallback" | "optional";
export type MaterialSymbolStyle = "outlined" | "rounded" | "sharp";
export type RobotoWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type RobotoSubset =
  | "cyrillic-ext"
  | "cyrillic"
  | "greek-ext"
  | "greek"
  | "latin-ext"
  | "latin"
  | "math"
  | "symbols"
  | "vietnamese";

export interface QuaffRobotoFontOptions {
  weights?: readonly RobotoWeight[];
  subsets?: readonly RobotoSubset[];
  formats?: readonly FontFormat[];
  display?: FontDisplay;
}

export interface QuaffIconFontOptions {
  styles?: readonly MaterialSymbolStyle[];
  /** Keep detected icon glyphs and component defaults, preserving all variable axes. */
  stripUnused?: boolean;
  /** Include icon names supplied by runtime data or code outside sourceDir. */
  safelist?: readonly string[];
  display?: FontDisplay;
}

export interface QuaffFontsOptions {
  /** Defaults to Roboto 400/500/700, all Unicode subsets, and WOFF2/WOFF. */
  roboto?: false | QuaffRobotoFontOptions;
  /** Defaults to all Material Symbols styles without glyph subsetting. */
  icons?: false | QuaffIconFontOptions;
}

export interface QuaffCssComplexSafelist {
  deep?: readonly RegExp[];
  greedy?: readonly RegExp[];
  standard?: readonly SafelistValue[];
}

export type QuaffCssSafelist = QuaffCssComplexSafelist | readonly SafelistValue[];

export interface QuaffAssetsCssOptions {
  dev?: DevelopmentCssMode;
  /** Remove unused base and utility selectors; safelist runtime-generated classes. */
  stripUnused?: boolean;
  safelist?: QuaffCssSafelist;
}

export interface QuaffAssetsOptions {
  css?: QuaffAssetsCssOptions;
  /** Select font files and optionally remove unused Material Symbols. */
  fonts?: QuaffFontsOptions;
  /** Component or utility exports supplied by code outside sourceDir. */
  include?: readonly CssExportName[];
  exclude?: readonly CssExportName[];
  rootLayout?: false | string;
  /** Application source directory scanned for usage. Defaults to src. */
  sourceDir?: string;
}
