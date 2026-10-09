import * as hb from "harfbuzzjs";
import { expect } from "vitest";
import { decodeWoff2 } from "../../lib/plugins/assets/fonts/subsetIconFont.js";

export function getFontFaces(css: string) {
  return [...css.matchAll(/@font-face\s*\{[^}]*\}/g)].map(([face]) => face);
}

export function stripFontFaces(css: string) {
  return css.replace(/@font-face\s*\{[^}]*\}/g, "");
}

export async function expectShapedIcons(bytes: Uint8Array, names: readonly string[]) {
  const decoded = await decodeWoff2(bytes);
  const font = new hb.Font(new hb.Face(new hb.Blob(decoded)));

  for (const name of names) {
    expectShapedIcon(font, name, 0);
    expectShapedIcon(font, name, 1);
  }
}

function expectShapedIcon(font: hb.Font, name: string, fill: number) {
  font.setVariations([new hb.Variation("FILL", fill)]);
  const buffer = new hb.Buffer();
  buffer.addText(name);
  buffer.guessSegmentProperties();
  hb.shape(font, buffer);
  const infos = buffer.getGlyphInfos();
  expect(infos, `${name} fill=${fill}`).toHaveLength(1);
  expect(infos[0].codepoint, name).not.toBe(0);
}
