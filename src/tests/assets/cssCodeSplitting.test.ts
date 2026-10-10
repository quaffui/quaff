import { chromium, type Page } from "playwright";
import { afterEach, describe, expect, it } from "vitest";
import { hasSelector } from "./cssFixture.js";
import { buildCssFixture, CHIP_SOURCE, cleanupCssBuildFixtures } from "./cssBuildFixture.js";

afterEach(cleanupCssBuildFixtures);

describe("CSS code splitting through Vite", () => {
  it("loads lazy component styles separately and shares each stylesheet once", async () => {
    const fixture = await buildCssFixture();
    const rootCss = fixture.readEntryCss("index.html");
    const buttonCss = fixture.readEntryCss("src/routes/buttons/+page.svelte");
    const fieldCss = fixture.readEntryCss("src/routes/fields/+page.svelte");
    const sliderCss = fixture.readEntryCss("src/slider.ts");

    expect(hasSelector(rootCss, ".q-pa-md")).toBe(true);
    expect(hasSelector(rootCss, ".q-mr-xs")).toBe(true);
    expect(hasSelector(rootCss, ".q-separator")).toBe(true);
    expect(hasSelector(rootCss, ".q-badge")).toBe(true);
    expect(hasSelector(rootCss, ".q-radio")).toBe(true);
    expect(hasSelector(rootCss, ".q-slider")).toBe(true);
    const componentLayers = (rootCss.match(/@layer ([^;]+);/)?.[1] ?? "")
      .split(",")
      .map((name) => name.trim());
    expect(componentLayers).toContain("Quaff.components.q-avatar");
    expect(componentLayers).toContain("Quaff.components.q-chip");
    expect(componentLayers.indexOf("Quaff.components.q-avatar")).toBeLessThan(
      componentLayers.indexOf("Quaff.components.q-chip")
    );

    for (const selector of [".q-btn", ".q-card", ".q-checkbox"]) {
      expect(hasSelector(rootCss, selector), `Root unexpectedly loads ${selector}`).toBe(false);
    }

    expect(hasSelector(buttonCss, ".q-card")).toBe(true);
    expect(hasSelector(buttonCss, ".q-checkbox")).toBe(false);
    expect(hasSelector(fieldCss, ".q-checkbox")).toBe(true);
    expect(hasSelector(fieldCss, ".q-card")).toBe(false);
    // Plain scripts can feed server-rendered markup, so their styles stay shared.
    expect(hasSelector(sliderCss, ".q-slider")).toBe(false);
    expect(hasSelector(sliderCss, ".q-card")).toBe(false);

    for (const css of [buttonCss, fieldCss]) {
      expect(hasSelector(css, ".q-btn")).toBe(true);
    }

    for (const selector of [".q-btn", ".q-badge"]) {
      const sharedStylesheets = [...fixture.stylesheets.values()].filter((css) =>
        hasSelector(css, selector)
      );
      expect(sharedStylesheets, `Duplicated ${selector} styles`).toHaveLength(1);
    }

    // SSR can discover lazy-page assets from the rendered source modules.
    expect(hasSelector(fixture.readSsrCss("src/routes/buttons/+page.svelte"), ".q-card")).toBe(
      true
    );
    expect(hasSelector(fixture.readSsrCss("src/routes/fields/+page.svelte"), ".q-checkbox")).toBe(
      true
    );
    await expectStableChipAvatar(fixture.stylesheets, rootCss);
  }, 15_000);

  it("retains one complete app stylesheet when Vite disables CSS splitting", async () => {
    const fixture = await buildCssFixture({ cssCodeSplit: false });
    expect(fixture.stylesheets.size).toBe(1);
    const css = [...fixture.stylesheets.values()][0];

    for (const selector of [
      ".q-pa-md",
      ".q-mr-xs",
      ".q-separator",
      ".q-btn",
      ".q-card",
      ".q-checkbox",
      ".q-slider",
      ".q-badge",
      ".q-radio",
    ]) {
      expect(hasSelector(css, selector), `Missing ${selector}`).toBe(true);
    }

    expect(hasSelector(css, ".q-table")).toBe(false);
  });

  it("shares styles for components rendered only by server code", async () => {
    const fixture = await buildCssFixture({ hasServerReport: true });
    const rootCss = fixture.readEntryCss("index.html");
    expect(hasSelector(rootCss, ".q-card")).toBe(true);
    expect(hasSelector(rootCss, ".q-checkbox")).toBe(false);
    expect(hasSelector(fixture.readEntryCss("src/routes/fields/+page.svelte"), ".q-checkbox")).toBe(
      true
    );
    const server = await fixture.start();
    const html = await server.renderReport();
    expect(html).toContain('class="q-card q-card--bordered"');
    expect(html).toContain("Server-rendered report");
    const browser = await chromium.launch();

    try {
      const page = await browser.newPage();
      await page.goto(server.url);
      const reload = page.waitForEvent("load");
      await fixture.removeServerReport();
      await reload;
      const styles = await page.locator("style").allTextContents();
      expect(hasSelector(styles.join("\n"), ".q-card")).toBe(false);
      await page.getByRole("button", { name: "Open buttons" }).click();
      const card = page.locator(".q-card");
      await card.waitFor();
      expect(await card.evaluate((element) => getComputedStyle(element).borderRadius)).toBe("12px");
    } finally {
      await browser.close();
    }
  }, 15_000);

  it("retains server component styles in CSS-only builds without an SSR environment", async () => {
    const fixture = await buildCssFixture({ isCssOnly: true, hasServerReport: true });
    const css = [...fixture.stylesheets.values()].join("\n");
    expect(hasSelector(css, ".q-card")).toBe(true);
    expect(hasSelector(css, ".q-mr-xs")).toBe(true);
    expect(hasSelector(css, ".q-checkbox")).toBe(false);
  });

  it("keeps styles attached to application modules inside a symlinked source directory", async () => {
    const fixture = await buildCssFixture({ isSourceSymlink: true, dev: "full" });
    const rootCss = fixture.readEntryCss("index.html");

    for (const selector of [".q-pa-md", ".q-separator", ".q-badge"]) {
      expect(hasSelector(rootCss, selector), `Missing ${selector} from root CSS`).toBe(true);
    }

    expect(hasSelector(rootCss, ".q-btn")).toBe(false);
    expect(hasSelector(fixture.readEntryCss("source/routes/buttons/+page.svelte"), ".q-btn")).toBe(
      true
    );
    const { url } = await fixture.start();
    const browser = await chromium.launch();

    try {
      const page = await browser.newPage();
      await page.goto(url);
      expect(
        await page.locator("main").evaluate((element) => getComputedStyle(element).padding)
      ).toBe("16px");
      const styleRules = await page.evaluate(() => {
        const rules = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules]);

        return rules.map((rule) => rule.cssText);
      });
      expect(styleRules.join("\n")).toContain(".q-table");
    } finally {
      await browser.close();
    }
  }, 15_000);

  it("reloads shared style ownership and layer precedence when sources change", async () => {
    const fixture = await buildCssFixture({ hasChipExample: false });
    const { url } = await fixture.start();
    const browser = await chromium.launch();

    try {
      const page = await browser.newPage();
      await page.goto(url);
      await page.getByRole("button", { name: "Open buttons" }).click();
      const badge = page.getByText("Ready", { exact: true });
      await badge.waitFor();
      expect(await badge.evaluate((element) => getComputedStyle(element).borderRadius)).toBe(
        "9999px"
      );
      const layerReload = page.waitForEvent("load");
      await fixture.addChipExample();
      await layerReload;
      await page.getByRole("button", { name: "Open buttons" }).click();
      const chipAvatar = page.locator(".q-chip__avatar");
      await chipAvatar.waitFor();
      expect(await chipAvatar.evaluate((element) => getComputedStyle(element).width)).toBe(
        "22.5px"
      );
      const reload = page.waitForEvent("load");
      await fixture.updatePreset("");
      await reload;
      await page.getByRole("button", { name: "Open buttons" }).click();
      await badge.waitFor();
      expect(await badge.evaluate((element) => getComputedStyle(element).borderRadius)).toBe(
        "9999px"
      );
    } finally {
      await browser.close();
    }
  }, 15_000);
});

async function expectStableChipAvatar(stylesheets: Map<string, string>, baseCss: string) {
  const emittedStylesheets = [...stylesheets.values()];
  const avatarCss = emittedStylesheets.find((stylesheet) => hasSelector(stylesheet, ".q-avatar"));
  const chipCss = emittedStylesheets.find((stylesheet) => hasSelector(stylesheet, ".q-chip"));

  if (!avatarCss || !chipCss) {
    throw new Error("Vite did not emit the avatar and chip stylesheets.");
  }

  expect(avatarCss).not.toBe(chipCss);
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();

    for (const stylesheetOrder of [
      [baseCss, avatarCss, chipCss],
      [chipCss, avatarCss, baseCss],
    ]) {
      const size = await readChipAvatarSize(page, stylesheetOrder);
      expect(size).toEqual({ width: "22.5px", height: "22.5px" });
    }
  } finally {
    await browser.close();
  }
}

async function readChipAvatarSize(page: Page, stylesheets: string[]) {
  await page.setContent(CHIP_SOURCE);

  for (const content of stylesheets) {
    await page.addStyleTag({ content });
  }

  return page.locator(".q-chip__avatar").evaluate((element) => ({
    width: getComputedStyle(element).width,
    height: getComputedStyle(element).height,
  }));
}
