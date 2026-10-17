import { expect } from "vitest";
import { settleAnimations } from "../support/animations";
import { createComponentTest } from "../support/browserTest";
import type { Page } from "playwright";

declare global {
  interface Window {
    sheetTransitions: string[];
  }
}

const it = createComponentTest({
  component: "side-sheet/VisibilityFixture.svelte",
  stylesheets: ["base", "components/side-sheet", "components/button", "components/icon"],
  readySelector: "#toggle",
});

it.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.sheetTransitions = [];
    document.addEventListener("transitionrun", (event) => {
      if (event.target instanceof Element && event.target.matches(".q-side-sheet")) {
        window.sheetTransitions.push((event as TransitionEvent).propertyName);
      }
    });
  });
});

function settle(page: Page) {
  return settleAnimations(page.locator(".q-side-sheet"));
}

async function toggle(page: Page) {
  await page.locator("#toggle").click();
  await settle(page);
}

it.for(["", "rtl"])(
  "keeps initially open sheets stable through SSR and hydration (%s)",
  async (query, { page, openFixture }) => {
    await openFixture(`ssr&${query}`);
    const sheet = page.locator(".q-side-sheet");
    expect(await sheet.getAttribute("open")).not.toBeNull();
    const before = await page.locator("main").boundingBox();
    expect(before!.width).toBe(384);
    await page.locator("#outside").focus();
    await page.evaluate(() => window.hydrateFixture());
    await settle(page);
    expect(await page.evaluate(() => window.sheetTransitions)).toEqual([]);
    expect(await page.locator("main").boundingBox()).toEqual(before);

    // Initial visibility must not lose focus restoration or later entrance/exit motion.
    await page.locator("#inside").focus();
    await page.keyboard.press("Escape");
    await settle(page);
    expect(await sheet.getAttribute("open")).toBeNull();
    expect(await page.locator("#outside").evaluate((el) => el === document.activeElement)).toBe(
      true
    );
    expect(await page.evaluate(() => window.sheetTransitions)).toHaveLength(1);
    await toggle(page);
    expect(await sheet.getAttribute("open")).not.toBeNull();
    expect(await page.evaluate(() => window.sheetTransitions)).toHaveLength(2);
  }
);

it("does not animate an initially open sheet in a client-only mount", async ({
  page,
  openFixture,
}) => {
  await openFixture();
  await page.locator(".q-side-sheet[open]").waitFor();
  await settle(page);
  expect(await page.evaluate(() => window.sheetTransitions)).toEqual([]);
  expect((await page.locator("main").boundingBox())!.width).toBe(384);
});

it.for(["", "modal"])(
  "animates a sheet first opened by the user (%s)",
  async (query, { page, openFixture }) => {
    await openFixture(`closed&${query}`);
    expect(await page.locator(".q-side-sheet").getAttribute("open")).toBeNull();
    await toggle(page);
    expect(await page.locator(".q-side-sheet").getAttribute("open")).not.toBeNull();
    expect(await page.evaluate(() => window.sheetTransitions)).not.toEqual([]);
    expect(await page.locator(".q-side-sheet").evaluate((el) => el.matches(":modal"))).toBe(
      query === "modal"
    );
  }
);

it("still opens an initially modal sheet in the top layer", async ({ page, openFixture }) => {
  await openFixture("ssr&modal");
  expect(await page.locator(".q-side-sheet").getAttribute("open")).toBeNull();
  await page.evaluate(() => window.hydrateFixture());
  await settle(page);
  expect(await page.locator(".q-side-sheet").evaluate((el) => el.matches(":modal"))).toBe(true);
  expect(await page.evaluate(() => window.sheetTransitions)).toContain("translate");
});

it("can switch an initially open standard sheet to modal", async ({ page, openFixture }) => {
  await openFixture();
  await settle(page);
  await page.locator("#modal").click();
  await settle(page);
  expect(await page.locator(".q-side-sheet").evaluate((el) => el.matches(":modal"))).toBe(true);
  await page.keyboard.press("Escape");
  await settle(page);
  expect(await page.locator(".q-side-sheet").getAttribute("open")).toBeNull();
});
