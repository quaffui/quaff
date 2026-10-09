import { afterEach, describe, expect, it, vi } from "vitest";
import { quaffCss } from "../../lib/plugins/css.js";
import {
  cleanupFontFixtures,
  createFontFixture,
  readDevelopmentCss,
  updateDevelopmentSource,
} from "./fontFixture.js";
import { readCssAsset } from "./cssFixture.js";
import { getFontFaces, stripFontFaces, expectShapedIcons } from "./fontAssertions.js";
import type { QuaffAssetsOptions } from "../../lib/plugins/assets.js";

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();

  return {
    ...actual,
    readFile: (...args: Parameters<typeof actual.readFile>) => {
      const css = readCssAsset(args[0]);

      return css === undefined ? actual.readFile(...args) : Promise.resolve(css);
    },
  };
});

const FONT_OPTIONS = {
  roboto: { weights: [400], subsets: ["latin"], formats: ["woff2"] },
  icons: { styles: ["outlined"], stripUnused: true, safelist: ["favorite"] },
} satisfies QuaffAssetsOptions["fonts"];
const LEGACY_LAYOUT = '<script>import "@quaffui/quaff/css/fonts.scss";</script><main>Text</main>';
const ICON_SOURCES = [
  {
    file: "navigation.json",
    name: "rocket_launch",
    createSource: (name: string) => JSON.stringify({ icon: name }),
    layout:
      '<script>import navigation from "../navigation.json";</script><span class="q-icon">{navigation.icon}</span>',
  },
  {
    file: "icons.css",
    name: "sailing",
    createSource: (name: string) => `.q-icon::before { content: "${name}"; }`,
    layout: '<script>import "../icons.css";</script><span class="q-icon"></span>',
  },
  {
    file: "icons.scss",
    name: "sailing",
    createSource: (name: string) => `.q-icon { &::before { content: "${name}"; } }`,
    layout: '<script>import "../icons.scss";</script><span class="q-icon"></span>',
  },
];

afterEach(cleanupFontFixtures);

describe("font integration with used CSS", () => {
  it("rejects the old CSS plugin with migration instructions", () => {
    expect(() => quaffCss()).toThrow("quaffCss() was replaced by quaffAssets()");
    expect(() => quaffCss()).toThrow("css.stripUnused");
  });

  it("replaces legacy fonts, injects used CSS, and emits subset assets under a custom base", async () => {
    const base = "/nested/app/";
    const fixture = await createFontFixture(
      {
        "routes/+layout.svelte": LEGACY_LAYOUT,
        "App.svelte": "<QSelect /><QDate /><QTime />",
      },
      { css: { stripUnused: true }, fonts: FONT_OPTIONS },
      base
    );
    const { css, fontAssets } = await fixture.build();
    const faces = getFontFaces(css);

    expect(css).toContain(".q-select");
    expect(css).not.toContain(".q-pa-xl");
    expect(faces).toHaveLength(2);
    expect(faces.some((face) => face.includes("Roboto"))).toBe(true);
    expect(faces.some((face) => face.includes("Material Symbols Outlined"))).toBe(true);
    expect(faces.some((face) => /Rounded|Sharp/.test(face))).toBe(false);
    expect(fontAssets).toHaveLength(2);

    for (const face of faces) {
      expect(face).toContain(`${base}assets/`);
    }

    const iconAsset = fontAssets.find((entry) => entry.fileName.includes("outlined"));

    if (!iconAsset || typeof iconAsset.source === "string") {
      throw new Error("Expected an emitted Outlined font containing binary data.");
    }

    const bytes = new Uint8Array(iconAsset.source);
    expect(bytes.byteLength).toBeLessThan(150_000);
    await expectShapedIcons(bytes, [
      "arrow_drop_up",
      "arrow_drop_down",
      "calendar_month",
      "schedule",
      "keyboard",
      "favorite",
    ]);
  }, 30_000);

  it("retains checked and mixed checkbox glyphs declared only in CSS", async () => {
    const fixture = await createFontFixture(
      { "routes/+layout.svelte": "<main>Text</main>", "App.svelte": "<QCheckbox />" },
      { fonts: { roboto: false, icons: { styles: ["outlined"], stripUnused: true } } }
    );
    const { fontAssets } = await fixture.build();
    const font = fontAssets.find((entry) => entry.fileName.endsWith(".woff2"));

    if (!font || typeof font.source === "string") {
      throw new Error("Expected a checkbox icon subset.");
    }

    await expectShapedIcons(new Uint8Array(font.source), ["check", "remove"]);
  }, 30_000);

  it.each(ICON_SOURCES)(
    "retains icon names supplied only by $file",
    async (source) => {
      const fixture = await createFontFixture(
        {
          "routes/+layout.svelte": source.layout,
          [source.file]: source.createSource(source.name),
        },
        { fonts: { roboto: false, icons: { styles: ["outlined"], stripUnused: true } } }
      );
      const { fontAssets } = await fixture.build();
      const font = fontAssets.find((entry) => entry.fileName.endsWith(".woff2"));

      if (!font || typeof font.source === "string") {
        throw new Error(`Expected an icon subset containing ${source.name} from ${source.file}.`);
      }

      const bytes = new Uint8Array(font.source);
      expect(bytes.byteLength).toBeLessThan(150_000);
      await expectShapedIcons(bytes, [source.name]);
    },
    30_000
  );

  it.each([
    {
      file: "App.svelte",
      createSource: (name: string) => `<QIcon name="${name}" />`,
    },
    ...ICON_SOURCES,
  ])(
    "invalidates font CSS when an icon changes in $file",
    async ({ file, createSource }) => {
      const original = createSource("home");
      const fixture = await createFontFixture(
        { "routes/+layout.svelte": "<main>Text</main>", [file]: original },
        {
          css: { stripUnused: true },
          fonts: { roboto: false, icons: { styles: ["outlined"], stripUnused: true } },
        }
      );
      const server = await fixture.start();
      const before = await readDevelopmentCss(server);
      const source = createSource("menu");
      const path = await fixture.write(file, source);
      const updated = await updateDevelopmentSource(fixture.plugin, server, path, source);
      const after = await readDevelopmentCss(server);

      expect(updated?.length).toBeGreaterThan(0);
      expect(after).not.toBe(before);
      expect(stripFontFaces(after)).toBe(stripFontFaces(before));
      expect(getFontFaces(after)).toHaveLength(1);
    },
    30_000
  );

  it("keeps font detection active when development serves the full stylesheet", async () => {
    const fixture = await createFontFixture(
      { "routes/+layout.svelte": "<main>Text</main>", "App.svelte": "<QSelect />" },
      {
        css: { dev: "full" },
        fonts: { roboto: false, icons: { styles: ["outlined"], stripUnused: true } },
      }
    );
    const css = await readDevelopmentCss(await fixture.start());

    expect(css).toContain(".q-table");
    expect(getFontFaces(css)).toHaveLength(1);
    expect(getFontFaces(css)[0]).toContain("Material Symbols Outlined");
  }, 30_000);

  it("still adds configured fonts when the layout already imports full Quaff CSS", async () => {
    const fixture = await createFontFixture(
      {
        "routes/+layout.svelte":
          '<script>import "@quaffui/quaff/css/index.css";</script><main>Text</main>',
        "App.svelte": "<QSelect />",
      },
      { fonts: { roboto: false, icons: { styles: ["outlined"], stripUnused: true } } }
    );
    const { css } = await fixture.build();

    expect(css).toContain(".q-table");
    expect(getFontFaces(css)).toHaveLength(1);
  }, 30_000);

  it("can disable both font families while retaining automatic component CSS", async () => {
    const fixture = await createFontFixture(
      { "routes/+layout.svelte": LEGACY_LAYOUT, "App.svelte": "<QIcon />" },
      { fonts: { roboto: false, icons: false } }
    );
    const { css, fontAssets } = await fixture.build();

    expect(css).toContain(".q-icon");
    expect(getFontFaces(css)).toHaveLength(0);
    expect(fontAssets).toHaveLength(0);
  });

  it("emits no icon font when subsetting finds no icons", async () => {
    const fixture = await createFontFixture(
      { "routes/+layout.svelte": "<main>Text</main>" },
      { fonts: { roboto: false, icons: { styles: ["outlined"], stripUnused: true } } }
    );
    const { css, fontAssets } = await fixture.build();

    expect(fontAssets).toHaveLength(0);
    expect(css).not.toContain("@font-face");
  });
});
