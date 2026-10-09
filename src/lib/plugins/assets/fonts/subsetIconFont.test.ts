import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import * as hb from "harfbuzzjs";
import { beforeAll, describe, expect, it } from "vitest";
import { subsetIconFont } from "./subsetIconFont.js";
import { decodeWoff2 } from "./subsetIconFont.js";

const REQUIRE = createRequire(import.meta.url);
const STYLES = ["outlined", "rounded", "sharp"] as const;
const ICONS = ["home", "check_circle", "arrow_drop_down", "brightness_2", "delete"];
const AXIS_SAMPLES: readonly Record<string, number>[] = [
  {},
  { FILL: 0.5, wght: 500, GRAD: 100, opsz: 32 },
  ...[0, 1].flatMap((FILL) =>
    [100, 700].flatMap((wght) =>
      [-50, 200].flatMap((GRAD) => [20, 48].map((opsz) => ({ FILL, wght, GRAD, opsz })))
    )
  ),
];

function createFont(input: Uint8Array): { face: hb.Face; font: hb.Font } {
  const face = new hb.Face(new hb.Blob(input));
  return { face, font: new hb.Font(face) };
}

function getShape(font: hb.Font, name: string, axes: Record<string, number>) {
  font.setVariations(Object.entries(axes).map(([tag, value]) => new hb.Variation(tag, value)));
  const buffer = new hb.Buffer();
  buffer.addText(name);
  buffer.guessSegmentProperties();
  hb.shape(font, buffer);
  const infos = buffer.getGlyphInfos();
  expect(infos).toHaveLength(1);
  expect(infos[0].codepoint).not.toBe(0);
  return {
    paths: infos.map(({ codepoint }) => font.glyphToPath(codepoint)),
    positions: buffer.getGlyphPositions(),
  };
}

describe.each(STYLES)("Material Symbols %s subsetting", (style) => {
  let input: Uint8Array;
  let output: Uint8Array;
  let original: ReturnType<typeof createFont>;
  let subset: ReturnType<typeof createFont>;

  beforeAll(async () => {
    input = await readFile(REQUIRE.resolve(`material-symbols/material-symbols-${style}.woff2`));
    output = await subsetIconFont(input, ICONS);
    original = createFont(await decodeWoff2(input));
    subset = createFont(await decodeWoff2(output));
  });

  it("returns a substantially smaller WOFF2 font", () => {
    expect(new TextDecoder().decode(output.subarray(0, 4))).toBe("wOF2");
    expect(output.byteLength).toBeLessThan(input.byteLength / 20);
  });

  it("preserves original variable axes and required shaping features", () => {
    expect(subset.face.getAxisInfos()).toEqual(original.face.getAxisInfos());
    expect(subset.face.getTableFeatureTags("GSUB")).toEqual(
      original.face.getTableFeatureTags("GSUB")
    );
    expect(Object.keys(subset.face.getAxisInfos())).toEqual(["FILL", "GRAD", "opsz", "wght"]);
  });

  it("preserves ligatures, outlines and positions across fill and variable-axis settings", () => {
    for (const name of ICONS) {
      for (const axes of AXIS_SAMPLES) {
        expect(getShape(subset.font, name, axes), `${name} ${JSON.stringify(axes)}`).toEqual(
          getShape(original.font, name, axes)
        );
      }
    }
  });

  it("preserves codepoint mappings for the selected icon glyphs", () => {
    const home = original.font.glyphFromName("home")!;
    const unicode = [...original.face.collectUnicodes()].find(
      (point) => original.font.nominalGlyph(point) === home
    );
    expect(unicode).toBeDefined();
    expect(subset.font.nominalGlyph(unicode!)).toBeDefined();
  });

  it("produces identical bytes regardless of name order and duplicates", async () => {
    expect(await subsetIconFont(input, [...ICONS].reverse().concat(ICONS[0]))).toEqual(output);
  });

  it("isolates concurrent subsets and recovers after a failed codec conversion", async () => {
    const selections = [["home"], ["check_circle", "delete"], ["arrow_drop_down"]];
    const expected: Uint8Array[] = [];

    for (const names of selections) {
      expected.push(await subsetIconFont(input, names));
    }

    const results = await Promise.all(
      Array.from({ length: 9 }, (_, index) => subsetIconFont(input, selections[index % 3]))
    );

    for (const [index, bytes] of results.entries()) {
      expect(bytes).toEqual(expected[index % 3]);
      const font = createFont(await decodeWoff2(bytes));

      for (const name of selections[index % 3]) {
        expect(getShape(font.font, name, { FILL: 1 })).toEqual(
          getShape(original.font, name, { FILL: 1 })
        );
      }
    }

    const recovery = await Promise.allSettled([
      decodeWoff2(new Uint8Array([1, 2, 3])),
      decodeWoff2(output),
    ]);

    expect(recovery[0].status).toBe("rejected");
    expect(recovery[1].status).toBe("fulfilled");
  }, 30_000);

  it("rejects unsupported icon names instead of silently emitting letter glyphs", async () => {
    await expect(subsetIconFont(input, ["home", "not_a_real_material_symbol"])).rejects.toThrow(
      "Unknown Material Symbol names in this font: not_a_real_material_symbol"
    );
  });

  it.each([[], [""], ["a"], ["Home"], ["home close"]].map((names) => ({ names })))(
    "rejects invalid name lists $names",
    async ({ names }) => {
      await expect(subsetIconFont(input, names)).rejects.toThrow(/Material Symbol/);
    }
  );
});
