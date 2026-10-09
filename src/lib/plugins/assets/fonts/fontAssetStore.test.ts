import { mkdtemp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { FontAssetStore } from "./fontAssetStore.js";

const FIXTURES: string[] = [];

afterEach(async () => {
  await Promise.all(
    FIXTURES.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
  );
});

async function createFixture(directoryName = "cache") {
  const root = await mkdtemp(join(tmpdir(), "quaff-font-assets-"));
  FIXTURES.push(root);

  return { root, cacheDir: join(root, directoryName) };
}

function getFile(url: string) {
  return decodeURIComponent(url.slice("/@fs/".length));
}

describe("font assets", () => {
  it("creates stable content-hashed URLs and writes only once", async () => {
    const config = await createFixture();
    const assets = new FontAssetStore(config);
    const bytes = new Uint8Array([1, 2, 3]);
    const first = await assets.writeAsset("outlined.woff2", bytes);
    const file = getFile(first);
    const original = await stat(file);
    const repeated = await Promise.all([
      assets.writeAsset("outlined.woff2", bytes),
      new FontAssetStore(config).writeAsset("outlined.woff2", bytes),
    ]);

    expect(repeated).toEqual([first, first]);
    expect(first).toMatch(/outlined-[a-f0-9]{16}\.woff2$/);
    expect(await readFile(file)).toEqual(Buffer.from(bytes));
    expect((await stat(file)).mtimeMs).toBe(original.mtimeMs);
    expect(await readdir(assets.directory)).toEqual([file.split("/").at(-1)]);
    expect(await assets.writeAsset("outlined.woff2", new Uint8Array([4]))).not.toBe(first);
  });

  it("escapes URL-significant characters without changing the cache path", async () => {
    const config = await createFixture("cache space ü");
    const assets = new FontAssetStore(config);
    const url = await assets.writeAsset("roboto.woff", new Uint8Array([1]));

    expect(url).toContain("cache%20space%20%C3%BC");
    expect(getFile(url)).toContain("cache space ü/quaff-fonts/");
    expect(await readFile(getFile(url))).toEqual(Buffer.from([1]));
  });

  it.each(["cache #", "cache ?", "cache %"])(
    "uses a stable per-project fallback for reserved Vite path characters: %s",
    async (directoryName) => {
      const config = await createFixture(directoryName);
      const assets = new FontAssetStore(config);
      FIXTURES.push(assets.directory);
      const repeated = new FontAssetStore(config);
      const other = new FontAssetStore({ ...config, cacheDir: `${config.cacheDir}-other` });
      const url = await assets.writeAsset("roboto.woff2", new Uint8Array([1]));

      expect(assets.directory).toMatch(/quaff-fonts\/[a-f0-9]{16}$/);
      expect(assets.directory).toBe(repeated.directory);
      expect(assets.directory).not.toBe(other.directory);
      expect(url).not.toMatch(/[?#%]/);
      expect(await readFile(getFile(url))).toEqual(Buffer.from([1]));
    }
  );

  it("resolves the consumer's font dependency before the plugin's dependency", async () => {
    const config = await createFixture();
    const packageDirectory = join(config.root, "node_modules", "material-symbols");
    await mkdir(packageDirectory, { recursive: true });
    const file = join(packageDirectory, "material-symbols-outlined.woff2");
    await writeFile(join(packageDirectory, "package.json"), '{"name":"material-symbols"}');
    await writeFile(file, new Uint8Array([9]));
    const assets = new FontAssetStore(config);

    expect(assets.resolveFile("material-symbols/material-symbols-outlined.woff2")).toBe(file);
    expect(await assets.readAsset("material-symbols/material-symbols-outlined.woff2")).toEqual(
      Buffer.from([9])
    );
  });

  it("falls back to installed plugin dependencies outside the application", async () => {
    const assets = new FontAssetStore(await createFixture());
    const file = assets.resolveFile("@fontsource/roboto/files/roboto-latin-400-normal.woff2");

    expect(file).toContain("roboto-latin-400-normal.woff2");
    expect(
      await assets.readAsset("@fontsource/roboto/files/roboto-latin-400-normal.woff2")
    ).toEqual(await readFile(file));
  });

  it.each(["../font.woff2", "font.ttf", "font.woff2?query", "/font.woff"])(
    "rejects invalid cache filenames: %s",
    async (name) => {
      const assets = new FontAssetStore(await createFixture());

      expect(() => assets.writeAsset(name, new Uint8Array([1]))).toThrow(
        "Invalid generated font name"
      );
    }
  );
});
