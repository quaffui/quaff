import { afterEach, describe, expect, it, vi } from "vitest";
import * as source from "../../lib/plugins/assets/analyzeSource.js";
import { AssetUsageState } from "../../lib/plugins/assets/assetUsageState.js";
import { cleanupCssFixtures, createCssFixture, readCssAsset } from "./cssFixture.js";
import type { ResolvedConfig } from "vite";

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

afterEach(async () => {
  vi.restoreAllMocks();
  await cleanupCssFixtures();
});

describe("shared source usage caching", () => {
  it("does not require application sources in full CSS mode with unstripped fonts", async () => {
    const state = new AssetUsageState(
      { root: "/missing-quaff-application", command: "serve" } as ResolvedConfig,
      { css: { dev: "full" }, fonts: { roboto: false, icons: { styles: ["outlined"] } } },
      undefined
    );

    expect(await state.getStylesheet()).toContain(".q-checkbox");
    expect(state.isSourcePath("/missing-quaff-application/src/App.svelte")).toBe(false);
  });

  it("shares font usage and parsed CSS until relevant source candidates change", async () => {
    const fixture = await createCssFixture(
      { "App.svelte": "<QCheckbox /> <QIcon>favorite</QIcon>" },
      { fonts: { icons: { stripUnused: true } } }
    );
    await fixture.getStylesheet();
    const analyze = vi.spyOn(source, "analyzeSource");
    const [first, concurrent] = await Promise.all([fixture.getFontUsage(), fixture.getFontUsage()]);

    expect(first).toBe(concurrent);
    expect(analyze).toHaveBeenCalled();
    const parsedStyles = analyze.mock.calls.length;
    expect(await fixture.getFontUsage()).toBe(first);
    expect(analyze).toHaveBeenCalledTimes(parsedStyles);

    await fixture.update("App.svelte", "<QCheckbox />\n<QIcon>favorite</QIcon>");
    expect(await fixture.getFontUsage()).toBe(first);

    await fixture.update("App.svelte", "<QCheckbox />\n<QIcon>home</QIcon>");
    const updated = await fixture.getFontUsage();

    expect(updated).not.toBe(first);
    expect(updated.sources.some((usage) => usage.candidates.has("home"))).toBe(true);
    expect(analyze).toHaveBeenCalledTimes(parsedStyles + 2);
  });

  it("refreshes usage for source creation and deletion", async () => {
    const fixture = await createCssFixture(
      { "App.svelte": "<QIcon>home</QIcon>" },
      { fonts: { icons: { stripUnused: true } } }
    );
    const initial = await fixture.getFontUsage();
    await fixture.update("Added.svelte", "<QIcon>pets</QIcon>");
    const added = await fixture.getFontUsage();

    expect(added).not.toBe(initial);
    expect(added.sources.some((usage) => usage.candidates.has("pets"))).toBe(true);
    await fixture.remove("Added.svelte");
    const removed = await fixture.getFontUsage();

    expect(removed).not.toBe(added);
    expect(removed.sources.some((usage) => usage.candidates.has("pets"))).toBe(false);
  });
});
