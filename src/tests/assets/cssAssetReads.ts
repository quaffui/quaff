import type * as FileSystem from "node:fs/promises";

/**
 * Mocks `node:fs/promises` so reads of the package's built CSS assets return the compiled
 * source stylesheets. Import it inside the `vi.mock` factory, which runs before imports.
 */
export async function mockCssAssetReads(importOriginal: () => Promise<typeof FileSystem>) {
  const actual = await importOriginal();

  return {
    ...actual,
    async readFile(...args: Parameters<typeof actual.readFile>) {
      // The CSS fixture reads through this module, so load it once reads begin.
      const { readCssAsset } = await import("./cssFixture");
      const css = readCssAsset(args[0]);

      return css ?? actual.readFile(...args);
    },
  };
}
