import { readFile, readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import * as hb from "harfbuzzjs";
import { describe, expect, it, vi } from "vitest";
import { decodeWoff2 } from "../../lib/plugins/assets/fonts/subsetIconFont.js";
import { expectShapedIcons, getFontFaces } from "./fontAssertions.js";
import { createFontFixture, readDevelopmentCss, updateDevelopmentSource } from "./fontFixture.js";
import type { QuaffAssetsOptions } from "../../lib/plugins/assets.js";
import type { Plugin, Rollup, ViteDevServer } from "vite";

type FontFixture = Awaited<ReturnType<typeof createFontFixture>>;

vi.mock("node:fs/promises", async (importOriginal) => {
  const { mockCssAssetReads } = await import("./cssAssetReads");

  return mockCssAssetReads(importOriginal);
});

const DEFAULT_OPTIONS = {
  fonts: {
    roboto: false,
    icons: {
      styles: ["outlined"],
      stripUnused: true,
      safelist: ["sailing"],
    },
  },
} satisfies QuaffAssetsOptions;
const HARD_OPTIONS = {
  fonts: {
    ...DEFAULT_OPTIONS.fonts,
    icons: { ...DEFAULT_OPTIONS.fonts.icons, strategy: "hard" },
  },
} satisfies QuaffAssetsOptions;
const APP_SOURCE = `<script>
  let isPlaying = $state(false);
  const name = $derived(isPlaying ? "volume_up" : "volume_off");
  function getPlaybackIcon() { return isPlaying ? "pause" : "play_arrow"; }
</script>
<QIcon {name} />
<QBtn icon={getPlaybackIcon()} />
<p title="home">title padding</p>`;
const INITIAL_SOURCE = `<script>
  const first = "home";
  const second = "menu";
  const name = $derived(first);
</script>
<QIcon {name} />
<p>Initial prose.</p>`;

describe("icon pruning modes through Vite", () => {
  it("keeps resolved values, component defaults and safelists without changing the implicit soft default", async () => {
    const files = {
      "routes/+layout.svelte": "<main>Text</main>",
      "App.svelte": APP_SOURCE,
      "Report.ts":
        'import { render } from "svelte/server"; import { QCheckbox } from "@quaffui/quaff"; render(QCheckbox);',
      "settings.json": '{"foo":"bar"}',
    };
    const { softFont, defaultFont, hardFont, hardCss } = await buildIconModes(files);

    expect(defaultFont).toEqual(softFont);
    expect(hardFont.byteLength).toBeLessThan(softFont.byteLength);
    expect(getFontFaces(hardCss)[0]).toContain("/preview/assets/");
    await expectShapedIcons(hardFont, [
      "volume_off",
      "volume_up",
      "pause",
      "play_arrow",
      "check",
      "remove",
      "sailing",
    ]);
    await expectShapedIcons(softFont, ["home", "title", "padding"]);
    await expectMissingIcons(hardFont, ["home", "title", "padding"]);
  });

  it("refreshes semantic edits and file creation/deletion, reusing unchanged and restored subsets", async () => {
    const options = {
      fonts: { ...HARD_OPTIONS.fonts, icons: { ...HARD_OPTIONS.fonts.icons, safelist: [] } },
    } satisfies QuaffAssetsOptions;
    const fixture = await createFontFixture(
      { "routes/+layout.svelte": "<main>Text</main>", "App.svelte": INITIAL_SOURCE },
      options
    );
    const server = await fixture.start();
    const initialCss = await readDevelopmentCss(server);
    const initialCache = await readSubsetCache(fixture.root);
    const proseSource = INITIAL_SOURCE.replace("Initial prose.", "Revised description.");
    const path = await fixture.write("App.svelte", proseSource);
    await updateDevelopmentSource(fixture.plugin, server, path, proseSource);

    expect(await readDevelopmentCss(server)).toBe(initialCss);
    expect(await readSubsetCache(fixture.root)).toEqual(initialCache);

    const updatedSource = proseSource.replace("$derived(first)", "$derived(second)");
    await fixture.write("App.svelte", updatedSource);
    await updateDevelopmentSource(fixture.plugin, server, path, updatedSource);
    const updatedCss = await readDevelopmentCss(server);

    expect(updatedCss).not.toBe(initialCss);
    await expectShapedIcons(await readDevelopmentFont(fixture.root, updatedCss), ["menu"]);
    await expectMissingIcons(await readDevelopmentFont(fixture.root, updatedCss), ["home"]);

    await fixture.write("App.svelte", INITIAL_SOURCE);
    await updateDevelopmentSource(fixture.plugin, server, path, INITIAL_SOURCE);

    expect(await readDevelopmentCss(server)).toBe(initialCss);
    expect(await readSubsetCache(fixture.root)).toEqual(expect.arrayContaining(initialCache));

    await verifySourceLifecycle(fixture, server, initialCss);
  });
});

async function buildIconModes(files: Record<string, string>) {
  const softOptions = {
    fonts: {
      ...DEFAULT_OPTIONS.fonts,
      icons: { ...DEFAULT_OPTIONS.fonts.icons, strategy: "soft" },
    },
  } satisfies QuaffAssetsOptions;
  const soft = await createFontFixture(files, softOptions);
  const legacy = await createFontFixture(files, DEFAULT_OPTIONS);
  const hard = await createFontFixture(files, HARD_OPTIONS, "/preview/");
  const softBuild = await soft.build();
  const defaultBuild = await legacy.build();
  const hardBuild = await hard.build();

  return {
    softFont: readIconBytes(softBuild.fontAssets),
    defaultFont: readIconBytes(defaultBuild.fontAssets),
    hardFont: readIconBytes(hardBuild.fontAssets),
    hardCss: hardBuild.css,
  };
}

async function verifySourceLifecycle(
  fixture: FontFixture,
  server: ViteDevServer,
  initialCss: string
) {
  const addedSource = '<QIcon name="sailing" />';
  const addedPath = await fixture.write("Extra.svelte", addedSource);
  await notifySourceChange(fixture.plugin, server, "create", addedPath, addedSource);
  const addedCss = await readDevelopmentCss(server);

  await expectShapedIcons(await readDevelopmentFont(fixture.root, addedCss), ["home", "sailing"]);
  await rm(addedPath);
  await notifySourceChange(fixture.plugin, server, "delete", addedPath, "");

  expect(await readDevelopmentCss(server)).toBe(initialCss);
  await expectMissingIcons(await readDevelopmentFont(fixture.root, initialCss), ["sailing"]);
}

function readIconBytes(fontAssets: readonly Rollup.OutputAsset[]) {
  expect(fontAssets).toHaveLength(1);
  const font = fontAssets[0];

  if (typeof font.source === "string") {
    throw new Error("Expected binary icon font data.");
  }

  return new Uint8Array(font.source);
}

async function readDevelopmentFont(root: string, css: string) {
  const url = getFontFaces(css)[0]?.match(/src:\s*url\(["']?([^"')]+)["']?\)/)?.[1];

  if (!url?.startsWith("/")) {
    throw new Error(`Expected a generated development font URL: ${getFontFaces(css)[0]}`);
  }

  let file = join(root, `.${decodeURI(url)}`);

  if (url.startsWith("/@fs/")) {
    file = decodeURI(url.slice("/@fs/".length));
  }

  return readFile(file);
}

async function readSubsetCache(root: string) {
  const directory = join(root, ".vite", "quaff-fonts", "subsets");
  const files = await readdir(directory);

  return Promise.all(
    files
      .sort()
      .map(async (name) => ({ name, modified: (await stat(join(directory, name))).mtimeMs }))
  );
}

async function expectMissingIcons(bytes: Uint8Array, names: readonly string[]) {
  const decoded = await decodeWoff2(bytes);
  const font = new hb.Font(new hb.Face(new hb.Blob(decoded)));

  for (const name of names) {
    const buffer = new hb.Buffer();
    buffer.addText(name);
    buffer.guessSegmentProperties();
    hb.shape(font, buffer);
    const glyphs = buffer.getGlyphInfos();
    const hasLigature = glyphs.length === 1 && glyphs[0].codepoint !== 0;
    expect(hasLigature, name).toBe(false);
  }
}

async function notifySourceChange(
  plugin: Plugin,
  server: ViteDevServer,
  type: "create" | "delete",
  file: string,
  source: string
) {
  const hook = plugin.hotUpdate;
  const handler = typeof hook === "function" ? hook : hook?.handler;

  if (!handler) {
    throw new Error("Expected environment-aware hot updates.");
  }

  const context = { environment: server.environments.client } as ThisParameterType<typeof handler>;

  await handler.call(context, {
    type,
    file,
    timestamp: Date.now(),
    read: async () => source,
    modules: [],
    server,
  });
}
