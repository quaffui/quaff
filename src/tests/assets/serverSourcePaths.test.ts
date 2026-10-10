import { win32 } from "node:path";
import { expect, it, vi } from "vitest";
import { AssetUsageState } from "../../lib/plugins/assets/assetUsageState.js";
import type { ResolvedConfig } from "vite";

const { SOURCES } = vi.hoisted(() => ({
  SOURCES: new Map([
    ["C:\\app\\src\\+page.server.ts", 'import Report from "./Report.svelte"; export { Report };'],
    ["C:\\app\\src\\Report.svelte", '<article class="q-card">Server report</article>'],
    ["C:\\app\\src\\App.svelte", '<label class="q-checkbox">Client control</label>'],
  ]),
}));

// Simulate native Windows scanner paths while Vite returns forward-slash module IDs.
vi.mock("node:path", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:path")>();

  return { ...actual, ...actual.win32 };
});

vi.mock("node:fs/promises", () => ({
  realpath: async (file: string) => file,
  readFile: async (file: string) => {
    const code = SOURCES.get(file);

    if (code === undefined) {
      throw new Error(`Unexpected source file: ${file}`);
    }

    return code;
  },
}));

vi.mock("../../lib/plugins/assets/sourceFiles.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/plugins/assets/sourceFiles.js")>();

  return {
    ...actual,
    findSourceFiles: async (_directory: string, sourceFiles: { files: string[] }) => {
      sourceFiles.files.push(...SOURCES.keys());

      return sourceFiles;
    },
  };
});

it("retains server-only component CSS when Vite resolves Windows module IDs", async () => {
  const config = {
    root: "C:\\app",
    command: "build",
    build: { cssCodeSplit: true },
    createResolver: () => async () => "C:/app/src/Report.svelte?direct",
  } as unknown as ResolvedConfig;
  const state = new AssetUsageState(config, {}, undefined, async (file) => {
    return `.q-${win32.basename(file, ".css")} { display: block; }`;
  });
  const stylesheet = await state.getStylesheet();

  expect(stylesheet).toContain(".q-card {");
  expect(stylesheet).not.toContain(".q-checkbox {");
});
