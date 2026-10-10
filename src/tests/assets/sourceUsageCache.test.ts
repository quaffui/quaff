import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as source from "../../lib/plugins/assets/analyzeSource.js";
import { AssetUsageState } from "../../lib/plugins/assets/assetUsageState.js";
import { cleanupCssFixtures, createCssFixture, hasSelector, readCssAsset } from "./cssFixture.js";
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
  it("preserves CSS ownership and source exclusions across symlink paths", async () => {
    const root = await mkdtemp(join(tmpdir(), "quaff-css-alias-"));
    const source = join(root, "source");
    const rootLayout = join(source, "routes/+layout.svelte");
    const remoteComponent = join(root, "server/Remote.svelte");
    const remoteAlias = join(root, "src/Remote.svelte");
    const displayedCode = join(source, "docs.snippets.ts");
    const displayedAlias = join(root, "src/docs.snippets.ts");
    const newDisplayedCode = join(source, "generated/new.docs.snippets.ts");
    const newDisplayedAlias = join(root, "src/generated/new.docs.snippets.ts");
    const LAYOUT_SOURCE =
      '<script>import "@quaffui/quaff/css/index.css";</script><main>Application</main>';
    const REMOTE_SOURCE = '<div class="q-radio">Remote content</div>';
    const DISPLAYED_SOURCE = "export const code = '<QTable><QIcon name=\"casino\" /></QTable>';";

    try {
      await mkdir(dirname(rootLayout), { recursive: true });
      await symlink(source, join(root, "src"), "dir");
      await writeFile(rootLayout, LAYOUT_SOURCE);
      await mkdir(dirname(remoteComponent));
      await writeFile(remoteComponent, REMOTE_SOURCE);
      await symlink(remoteComponent, remoteAlias);
      await writeFile(displayedCode, DISPLAYED_SOURCE);
      const state = new AssetUsageState(
        { root, command: "build", build: { cssCodeSplit: true } } as ResolvedConfig,
        {
          rootLayout: "source/routes/+layout.svelte",
          sourceExclude: ["src/**/*.snippets.ts", "**/+layout.svelte"],
          fonts: { icons: { stripUnused: true } },
        },
        rootLayout
      );
      const stylesheet = await state.getStylesheet();
      expect(state.isSourcePath(rootLayout)).toBe(true);
      expect(state.isSourcePath(join(root, "src/routes/+layout.svelte"))).toBe(true);
      expect(state.shouldSplitCss()).toBe(false);
      expect(hasSelector(stylesheet, ".q-btn")).toBe(false);
      expect(await state.updateFile("update", rootLayout, () => LAYOUT_SOURCE)).toBe(false);
      expect(state.shouldSplitCss()).toBe(false);
      expect(await state.getStylesheet()).toBe(stylesheet);

      await state.updateFile("update", rootLayout, () => "<main>Application</main>");
      expect(state.shouldSplitCss()).toBe(true);
      expect(hasSelector(await state.getStylesheet(), ".q-radio")).toBe(true);
      expect(hasSelector(await state.getStylesheet(), ".q-table")).toBe(false);

      for (const file of [remoteAlias, remoteComponent]) {
        expect(await state.getSourceStylesheets(file, REMOTE_SOURCE)).toEqual([]);
      }

      await mkdir(dirname(newDisplayedCode));
      await writeFile(newDisplayedCode, DISPLAYED_SOURCE);

      for (const file of [displayedAlias, displayedCode, newDisplayedAlias, newDisplayedCode]) {
        expect(state.isSourcePath(file)).toBe(false);
        expect(await state.getSourceStylesheets(file, DISPLAYED_SOURCE)).toEqual([]);
      }

      expect(await state.updateFile("create", newDisplayedCode, () => DISPLAYED_SOURCE)).toBe(
        false
      );
      expect(hasSelector(await state.getStylesheet(), ".q-table")).toBe(false);
      const usage = await state.getFontUsage();
      expect(usage.components.has("QTable")).toBe(false);
      expect(usage.sources.some((entry) => entry.candidates.has("casino"))).toBe(false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

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
