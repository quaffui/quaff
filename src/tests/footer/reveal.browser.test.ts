import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "footer/RevealFixture.svelte",
  stylesheets: ["base", "components/layout", "components/footer"],
  readySelector: "#footer",
});

function isFooterCollapsed(page: Page) {
  return page.locator("#footer").evaluate((element) => element.matches(".q-footer--collapsed"));
}

it("reveals the footer when a resized layout puts the scroll position in the reveal zone", async ({
  page,
  openFixture,
}) => {
  await openFixture();
  await page.locator(".q-layout__content").evaluate((element) => element.scrollTo(0, 1000));
  await expect.poll(() => isFooterCollapsed(page)).toBe(true);

  await page.locator("#frame").evaluate((element) => (element.style.height = "900px"));

  await expect.poll(() => isFooterCollapsed(page)).toBe(false);
});
