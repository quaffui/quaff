import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest";
import type { Page } from "playwright";

declare global {
  interface Window {
    rootClicks: string[];
  }
}

const it = createComponentTest({
  component: "dialog/ClickFixture.svelte",
  stylesheets: ["base", "components/dialog", "components/drawer", "components/menu"],
  readySelector: "#dialog-action",
  pageOptions: { viewport: { width: 1280, height: 720 } },
  async onOpen(page) {
    // SvelteKit's router listens on <html>, above the app's root element.
    await page.evaluate(() => {
      window.rootClicks = [];
      document.documentElement.addEventListener("click", (event) => {
        window.rootClicks.push((event.target as Element).id);
      });
    });
    // Dialogs and drawers start listening for outside clicks 150ms after opening.
    await page.waitForTimeout(200);
  },
});

function readState(
  page: Page,
  name: "dialog" | "other-dialog" | "drawer" | "menu" | "menu-dialog"
) {
  return page.locator("#state").getAttribute(`data-${name}`);
}

function readRootClicks(page: Page) {
  return page.evaluate(() => window.rootClicks);
}

it("lets clicks inside a dialog reach page-level listeners", async ({ page, openFixture }) => {
  await openFixture();
  await page.locator("#dialog-action").click();
  await page.locator("#dialog-link").click();

  expect(await readRootClicks(page)).toEqual(["dialog-action", "dialog-link"]);
  expect(await readState(page, "dialog")).toBe("true");
});

it("closes when clicking outside the dialog", async ({ page, openFixture }) => {
  await openFixture();
  await page.locator("#outside").click();

  await expect.poll(() => readState(page, "dialog")).toBe("false");
});

it("does not treat clicks in another dialog as outside clicks", async ({ page, openFixture }) => {
  await openFixture("other");
  await page.locator("#other-dialog-action").click();

  expect(await readState(page, "dialog")).toBe("true");
  expect(await readState(page, "other-dialog")).toBe("true");
});

it("keeps an open drawer open when clicking inside a dialog", async ({ page, openFixture }) => {
  await openFixture("drawer");
  await page.locator("#dialog-action").click();

  expect(await readState(page, "drawer")).toBe("true");

  await page.locator("#outside").click();

  await expect.poll(() => readState(page, "drawer")).toBe("false");
});

it("keeps an auto-closing menu open when clicking inside a dialog it contains", async ({
  page,
  openFixture,
}) => {
  await openFixture("menu", { readySelector: "#open-menu-dialog" });
  await page.locator("#open-menu-dialog").click();
  await page.locator("#menu-dialog-action").waitFor();
  await page.waitForTimeout(200);
  await page.locator("#menu-dialog-action").click();

  expect(await readState(page, "menu")).toBe("true");
  expect(await readState(page, "menu-dialog")).toBe("true");
});
