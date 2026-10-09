import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FontAssetStore } from "./fontAssetStore.js";
import { IconFontStylesheet, type FontSourceUsage } from "./iconFontStylesheet.js";
import { FontStylesheet } from "./fontStylesheet.js";

const directories = new Set<string>();

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    [...directories].map((directory) => rm(directory, { recursive: true, force: true }))
  );
  directories.clear();
});

async function createStore() {
  const root = await mkdtemp(join(tmpdir(), "quaff-subset-cache-"));
  directories.add(root);
  const config = { root, cacheDir: join(root, ".vite") };

  return { config, store: new FontAssetStore(config) };
}

function createCachedFont() {
  const bytes = new Uint8Array(48);
  const header = new DataView(bytes.buffer);
  header.setUint32(0, 0x774f4632);
  header.setUint32(8, bytes.byteLength);

  return bytes;
}

function createIconUsage(name: string): FontSourceUsage {
  return {
    sources: [
      {
        candidates: new Set([name]),
        componentPaths: new Set(),
        hasFullCssImport: false,
        hasVirtualCssImport: false,
      },
    ],
    components: new Set(),
  };
}

describe("persistent icon subset cache", () => {
  it("shares concurrent generation and reuses subsets across plugin instances", async () => {
    const { config, store } = await createStore();
    const create = vi.fn(async () => createCachedFont());
    const original = new Uint8Array([1, 2, 3]);
    const results = await Promise.all([
      store.getOrCreateSubset(original, ["home", "pets"], create),
      store.getOrCreateSubset(original, ["pets", "home", "home"], create),
    ]);

    expect(create).toHaveBeenCalledTimes(1);
    expect(results[0]).toEqual(results[1]);
    const restarted = new FontAssetStore(config);
    expect([...(await restarted.getOrCreateSubset(original, ["pets", "home"], create))]).toEqual([
      ...results[0],
    ]);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("invalidates cached subsets when input bytes or selected names change", async () => {
    const { store } = await createStore();
    const create = vi.fn(async () => createCachedFont());
    await store.getOrCreateSubset(new Uint8Array([1]), ["home"], create);
    await store.getOrCreateSubset(new Uint8Array([2]), ["home"], create);
    await store.getOrCreateSubset(new Uint8Array([1]), ["pets"], create);

    expect(create).toHaveBeenCalledTimes(3);
  });

  it("retries failed generation and rebuilds damaged disk entries", async () => {
    const { config, store } = await createStore();
    const original = new Uint8Array([1]);
    const create = vi
      .fn(async () => createCachedFont())
      .mockRejectedValueOnce(new Error("Temporary failure"));
    await expect(store.getOrCreateSubset(original, ["home"], create)).rejects.toThrow(
      "Temporary failure"
    );
    await store.getOrCreateSubset(original, ["home"], create);
    const directory = join(store.directory, "subsets");
    const [filename] = await readdir(directory);
    await writeFile(join(directory, filename), new Uint8Array([0]));
    await new FontAssetStore(config).getOrCreateSubset(original, ["home"], create);

    expect(create).toHaveBeenCalledTimes(3);
  });
});

describe("font selection caching", () => {
  it("keeps recent selections for undo", async () => {
    const { store } = await createStore();
    vi.spyOn(store, "getOrCreateSubset").mockResolvedValue(createCachedFont());
    const icons = new IconFontStylesheet(store, { styles: ["outlined"], stripUnused: true });
    const home = createIconUsage("home");
    const first = await icons.getStylesheet(home);
    await icons.getStylesheet(createIconUsage("pets"));

    expect(await icons.getStylesheet(home)).toBe(first);
    expect(store.getOrCreateSubset).toHaveBeenCalledTimes(2);
  });

  it("needs source usage only when stripping icon glyphs", async () => {
    const { config } = await createStore();
    const disabled = new FontStylesheet(config, { roboto: false, icons: false });
    const full = new FontStylesheet(config, { roboto: false, icons: { styles: ["outlined"] } });
    const stripped = new FontStylesheet(config, { roboto: false, icons: { stripUnused: true } });

    expect(disabled.needsUsage).toBe(false);
    expect(full.needsUsage).toBe(false);
    expect(stripped.needsUsage).toBe(true);
    expect(await disabled.getStylesheet()).not.toContain("@font-face");
    expect(await full.getStylesheet()).toContain("Material Symbols Outlined");
    await expect(stripped.getStylesheet()).rejects.toThrow("Icon usage is required");
  });
});
