import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest.js";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "list/LinesFixture.svelte",
  stylesheets: ["base", "components/list"],
  readySelector: "#standard",
  pageOptions: { viewport: { width: 1280, height: 720 } },
});

function readRowHeights(page: Page, selector: string) {
  return page
    .locator(selector)
    .evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height));
}

it("gives server-rendered multi-line rows their final size", async ({ page, openFixture }) => {
  await openFixture("ssr");
  const selector = ":is(#standard, #dense, #expressive) > .q-item";
  const serverHeights = await readRowHeights(page, selector);
  await page.evaluate(() => window.hydrateFixture());

  expect(serverHeights).toEqual(await readRowHeights(page, selector));
  // One, two and three lines in a standard, a dense and an expressive list.
  expect(serverHeights).toEqual([56, 72, 88, 40, 60, 88, 56, 72, 88]);
});

it("sizes rows with wrapped sections before and after hydration", async ({ page, openFixture }) => {
  await openFixture("ssr");
  const serverHeights = await readRowHeights(page, "#wrapped > .q-item");
  await page.evaluate(() => window.hydrateFixture());
  const hydratedHeights = await readRowHeights(page, "#wrapped > .q-item");

  expect({ serverHeights, hydratedHeights }).toEqual({
    serverHeights: [72, 88],
    hydratedHeights: [72, 88],
  });
  expect(await page.locator("#wrapped-two.q-item--multiline").count()).toBe(1);
  expect(await page.locator("#wrapped-three.q-item--three-line").count()).toBe(1);
});

it("applies a wrapped section's line count only to its own row", async ({ page, openFixture }) => {
  await openFixture("ssr");
  const minHeights = await page
    .locator("#outer-row, #nested-row")
    .evaluateAll((rows) => rows.map((row) => getComputedStyle(row).minHeight));

  expect(minHeights).toEqual(["56px", "72px"]);
});

function readMixedRowLayout(page: Page) {
  return page.locator("#mixed-row").evaluate((row) => ({
    alignItems: getComputedStyle(row).alignItems,
    height: row.getBoundingClientRect().height,
  }));
}

it("sizes a wrapped three-line section alongside a nested three-line row", async ({
  page,
  openFixture,
}) => {
  await openFixture("ssr");
  const serverLayout = await readMixedRowLayout(page);
  await page.evaluate(() => window.hydrateFixture());
  const hydratedLayout = await readMixedRowLayout(page);

  expect(hydratedLayout).toEqual({ alignItems: "flex-start", height: 112 });
  expect(serverLayout).toEqual(hydratedLayout);
});
