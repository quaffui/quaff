import { chromium, type Browser, type Page } from "playwright";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { startFixture } from "./fixture";

declare global {
  interface Window {
    hydrateSheet: () => Promise<void>;
    sheetTransitions: string[];
  }
}

let browser: Browser;
let page: Page;
let fixture: Awaited<ReturnType<typeof startFixture>>;

beforeAll(async () => {
  fixture = await startFixture();
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.goto(fixture.url);
  await page.locator(".q-side-sheet[open]").waitFor();
  await page.close();
}, 30_000);

beforeEach(async () => {
  page = await browser.newPage();
  await page.addInitScript(() => {
    window.sheetTransitions = [];
    document.addEventListener("transitionrun", (event) => {
      if (event.target instanceof Element && event.target.matches(".q-side-sheet")) {
        window.sheetTransitions.push((event as TransitionEvent).propertyName);
      }
    });
  });
});

afterEach(async () => {
  await page?.close();
});

afterAll(async () => {
  await browser?.close();
  await fixture?.close();
});

async function settle() {
  await page.locator(".q-side-sheet").evaluate(async (element) => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(element.getAnimations().map((animation) => animation.finished));
  });
}

async function toggle() {
  await page.locator("#toggle").click();
  await settle();
}

it.each(["", "rtl"])(
  "keeps initially open sheets stable through SSR and hydration (%s)",
  async (query) => {
    await page.goto(`${fixture.url}?ssr&${query}`);
    const sheet = page.locator(".q-side-sheet");
    expect(await sheet.getAttribute("open")).not.toBeNull();
    const before = await page.locator("main").boundingBox();
    expect(before!.width).toBe(384);
    await page.locator("#outside").focus();
    await page.evaluate(() => window.hydrateSheet());
    await settle();
    expect(await page.evaluate(() => window.sheetTransitions)).toEqual([]);
    expect(await page.locator("main").boundingBox()).toEqual(before);

    // Initial visibility must not lose focus restoration or later entrance/exit motion.
    await page.locator("#inside").focus();
    await page.keyboard.press("Escape");
    await settle();
    expect(await sheet.getAttribute("open")).toBeNull();
    expect(await page.locator("#outside").evaluate((el) => el === document.activeElement)).toBe(
      true
    );
    expect(await page.evaluate(() => window.sheetTransitions)).toHaveLength(1);
    await toggle();
    expect(await sheet.getAttribute("open")).not.toBeNull();
    expect(await page.evaluate(() => window.sheetTransitions)).toHaveLength(2);
  }
);

it("does not animate an initially open sheet in a client-only mount", async () => {
  await page.goto(fixture.url);
  await page.locator(".q-side-sheet[open]").waitFor();
  await settle();
  expect(await page.evaluate(() => window.sheetTransitions)).toEqual([]);
  expect((await page.locator("main").boundingBox())!.width).toBe(384);
});

it.each(["", "modal"])("animates a sheet first opened by the user (%s)", async (query) => {
  await page.goto(`${fixture.url}?closed&${query}`);
  expect(await page.locator(".q-side-sheet").getAttribute("open")).toBeNull();
  await toggle();
  expect(await page.locator(".q-side-sheet").getAttribute("open")).not.toBeNull();
  expect(await page.evaluate(() => window.sheetTransitions)).not.toEqual([]);
  expect(await page.locator(".q-side-sheet").evaluate((el) => el.matches(":modal"))).toBe(
    query === "modal"
  );
});

it("still opens an initially modal sheet in the top layer", async () => {
  await page.goto(`${fixture.url}?ssr&modal`);
  expect(await page.locator(".q-side-sheet").getAttribute("open")).toBeNull();
  await page.evaluate(() => window.hydrateSheet());
  await settle();
  expect(await page.locator(".q-side-sheet").evaluate((el) => el.matches(":modal"))).toBe(true);
  expect(await page.evaluate(() => window.sheetTransitions)).toContain("translate");
});

it("can switch an initially open standard sheet to modal", async () => {
  await page.goto(fixture.url);
  await settle();
  await page.locator("#modal").click();
  await settle();
  expect(await page.locator(".q-side-sheet").evaluate((el) => el.matches(":modal"))).toBe(true);
  await page.keyboard.press("Escape");
  await settle();
  expect(await page.locator(".q-side-sheet").getAttribute("open")).toBeNull();
});
