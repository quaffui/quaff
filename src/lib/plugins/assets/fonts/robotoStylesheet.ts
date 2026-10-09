import { getFontDisplay, selectFontValues } from "./fontOptions.js";
import type { FontAssetStore } from "./fontAssetStore.js";
import type {
  FontDisplay,
  FontFormat,
  QuaffRobotoFontOptions,
  RobotoSubset,
  RobotoWeight,
} from "../assetOptions.js";

const DEFAULT_WEIGHTS = [400, 500, 700] as const;
const FONT_FORMATS = ["woff2", "woff"] as const;
const DECODER = new TextDecoder();

interface RobotoFontFace {
  weight: RobotoWeight;
  subset: RobotoSubset;
  formats: readonly FontFormat[];
  display: FontDisplay;
  unicodeRange: string;
}

export async function createRobotoStylesheet(
  assets: FontAssetStore,
  options: false | QuaffRobotoFontOptions = {}
) {
  if (options === false) {
    return "";
  }

  const metadataBytes = await assets.readAsset("@fontsource/roboto/metadata.json");
  const metadata = JSON.parse(DECODER.decode(metadataBytes)) as {
    subsets: RobotoSubset[];
    weights: RobotoWeight[];
  };
  const unicodeBytes = await assets.readAsset("@fontsource/roboto/unicode.json");
  const unicode = JSON.parse(DECODER.decode(unicodeBytes)) as Record<RobotoSubset, string>;
  const weights = selectFontValues(
    options.weights,
    DEFAULT_WEIGHTS,
    metadata.weights,
    "Roboto weights"
  );
  const subsets = selectFontValues(
    options.subsets,
    metadata.subsets,
    metadata.subsets,
    "Roboto subsets"
  );
  const formats = selectFontValues(options.formats, FONT_FORMATS, FONT_FORMATS, "Roboto formats");
  const display = getFontDisplay(options.display, "swap");
  const declarations: string[] = [];

  for (const weight of weights) {
    const faces = await Promise.all(
      subsets.map((subset) =>
        createRobotoFontFace(assets, {
          weight,
          subset,
          formats,
          display,
          unicodeRange: unicode[subset],
        })
      )
    );
    declarations.push(...faces);
  }

  return declarations.join("\n");
}

async function createRobotoFontFace(assets: FontAssetStore, options: RobotoFontFace) {
  const sources: string[] = [];

  for (const format of options.formats) {
    const name = `roboto-${options.subset}-${options.weight}-normal.${format}`;
    const bytes = await assets.readAsset(`@fontsource/roboto/files/${name}`);
    const url = await assets.writeAsset(name, bytes);
    sources.push(`url("${url}") format("${format}")`);
  }

  return `@font-face{font-family:"Roboto";font-style:normal;font-weight:${options.weight};font-display:${options.display};src:${sources.join(",")};unicode-range:${options.unicodeRange};}`;
}
