import { createRequire } from "node:module";
import * as hb from "harfbuzzjs";
import { subsetSfntFont } from "./harfbuzzSubset.js";

interface Woff2Codec {
  compress(input: Uint8Array): Promise<Uint8Array>;
  decompress(input: Uint8Array): Promise<Uint8Array>;
}

const REQUIRE = createRequire(import.meta.url);
const WOFF2 = REQUIRE("wawoff2") as Woff2Codec;
let processing = Promise.resolve();

async function convertWoff2(input: Uint8Array, operation: keyof Woff2Codec): Promise<Uint8Array> {
  const previousConversion = processing;
  let releaseConversion!: () => void;
  processing = new Promise<void>((resolve) => {
    releaseConversion = resolve;
  });

  try {
    await previousConversion;

    // The codec returns shared WASM memory; copy it before starting another conversion.
    return new Uint8Array(await WOFF2[operation](input));
  } finally {
    releaseConversion();
  }
}

export function decodeWoff2(input: Uint8Array): Promise<Uint8Array> {
  return convertWoff2(input, "decompress");
}

export function encodeWoff2(input: Uint8Array): Promise<Uint8Array> {
  return convertWoff2(input, "compress");
}

const ICON_NAME = /^[a-z0-9][a-z0-9_]+$/;
const FILL_VALUES = [0, 1] as const;

function normalizeIconNames(names: readonly string[]): string[] {
  const normalized = [...new Set(names)].sort();

  if (normalized.length === 0) {
    throw new Error("At least one Material Symbol is required for an icon font subset.");
  }

  const invalid = normalized.filter((name) => !ICON_NAME.test(name));

  if (invalid.length > 0) {
    throw new Error(`Invalid Material Symbol names: ${invalid.join(", ")}.`);
  }

  return normalized;
}

function collectIconGlyphs(font: hb.Font, names: readonly string[]): Set<number> {
  const glyphs = new Set<number>();
  const unknown = new Set<string>();
  const buffer = new hb.Buffer();

  for (const fill of FILL_VALUES) {
    font.setVariations([new hb.Variation("FILL", fill)]);
    collectGlyphsForFill(font, buffer, names, glyphs, unknown);
  }

  if (unknown.size > 0) {
    throw new Error(`Unknown Material Symbol names in this font: ${[...unknown].join(", ")}.`);
  }

  return glyphs;
}

function collectGlyphsForFill(
  font: hb.Font,
  buffer: hb.Buffer,
  names: readonly string[],
  glyphs: Set<number>,
  unknown: Set<string>
) {
  for (const name of names) {
    buffer.clearContents();
    buffer.addText(name);
    buffer.guessSegmentProperties();
    hb.shape(font, buffer);
    const infos = buffer.getGlyphInfos();
    const hasIconGlyph = infos.length === 1 && infos[0].codepoint !== 0;

    if (!hasIconGlyph) {
      unknown.add(name);
      continue;
    }

    glyphs.add(infos[0].codepoint);
  }
}

function collectIconUnicodes(
  face: hb.Face,
  font: hb.Font,
  names: readonly string[],
  glyphs: ReadonlySet<number>
): Set<number> {
  const unicodes = new Set([...names.join("")].map((character) => character.codePointAt(0)!));

  for (const unicode of face.collectUnicodes()) {
    const glyph = font.nominalGlyph(unicode);

    if (glyph !== undefined && glyphs.has(glyph)) {
      unicodes.add(unicode);
    }
  }

  return unicodes;
}

export async function subsetIconFont(
  input: Uint8Array,
  names: readonly string[]
): Promise<Uint8Array> {
  const normalized = normalizeIconNames(names);
  const decoded = await decodeWoff2(input);
  const face = new hb.Face(new hb.Blob(decoded));
  const font = new hb.Font(face);
  const glyphs = collectIconGlyphs(font, normalized);
  const unicodes = collectIconUnicodes(face, font, normalized, glyphs);
  const subset = await subsetSfntFont(decoded, glyphs, unicodes);
  return encodeWoff2(subset);
}
