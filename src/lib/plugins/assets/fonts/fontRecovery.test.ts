import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeSource } from "../analyzeSource.js";
import { FontAssetStore } from "./fontAssetStore.js";
import { IconFontStylesheet, type FontSourceUsage } from "./iconFontStylesheet.js";

const directories = new Set<string>();

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all([...directories].map((dir) => rm(dir, { recursive: true, force: true })));
  directories.clear();
});

async function createStore() {
  const root = await mkdtemp(join(tmpdir(), "quaff-font-recovery-"));
  directories.add(root);

  return new FontAssetStore({ root, cacheDir: join(root, ".vite") });
}

describe("font loading recovery", () => {
  it("retries a failed filesystem read after the font file becomes readable", async () => {
    const store = await createStore();
    const file = join(store.directory, "font.woff2");
    await mkdir(file, { recursive: true });
    vi.spyOn(store, "resolveFile").mockReturnValue(file);
    await expect(store.readAsset("test-font")).rejects.toMatchObject({ code: "EISDIR" });

    await rm(file, { recursive: true });
    await writeFile(file, new Uint8Array([1, 2, 3]));

    expect([...(await store.readAsset("test-font"))]).toEqual([1, 2, 3]);
  });

  it("retries icon metadata after a dependency is repaired without recreating the stylesheet", async () => {
    const store = await createStore();
    const originalRead = store.readAsset.bind(store);
    vi.spyOn(store, "readAsset").mockRejectedValueOnce(new Error("Dependency not installed"));
    const stylesheet = new IconFontStylesheet(store, { styles: ["outlined"], stripUnused: true });
    const usage: FontSourceUsage = {
      sources: [await analyzeSource('<QIcon name="home" />')],
      components: new Set(),
    };

    await expect(stylesheet.getStylesheet(usage)).rejects.toThrow("Dependency not installed");
    vi.mocked(store.readAsset).mockImplementation(originalRead);

    await expect(stylesheet.getStylesheet(usage)).resolves.toContain("Material Symbols Outlined");
    expect(store.readAsset).toHaveBeenCalledWith(
      "material-symbols/material-symbols-outlined.woff2"
    );
  });
});
