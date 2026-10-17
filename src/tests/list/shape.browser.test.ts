import { render } from "svelte/server";
import { expect, vi } from "vitest";
import { createBrowserTest } from "../support/browserTest";
import { createFixtureCss } from "../support/componentServer";
import ShapeFixture from "./ShapeFixture.svelte";
import type { Page } from "playwright";
import type { ComponentProps } from "svelte";

vi.mock("$app/state", () => ({ page: { url: new URL("https://example.test/") } }));

const SMALL = ["4px", "4px", "4px", "4px"];
const LARGE = ["16px", "16px", "16px", "16px"];
const HOVER = ["12px", "12px", "12px", "12px"];
const EXPANSION_HEADERS = ".q-expansion-item > :is(.q-item, .q-expansion-item__header)";
const css = await createFixtureCss([
  "components/list",
  "components/separator",
  "components/expansion-item",
]);
const it = createBrowserTest();

// Render real components; native CSS states need no client fixture server.
async function renderFixture(page: Page, props: ComponentProps<typeof ShapeFixture> = {}) {
  const { body } = render(ShapeFixture, { props });
  await page.setContent(`<style>${css}</style>${body}`);
  await page.mouse.move(0, 0);
}

async function readCorners(page: Page, selector = ".q-item") {
  return page.locator(selector).evaluateAll((items) =>
    items.map((item) => {
      for (const animation of item.getAnimations()) {
        animation.finish();
      }

      const style = getComputedStyle(item);
      return [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomLeftRadius,
        style.borderBottomRightRadius,
      ];
    })
  );
}

it.for([false, true])("rounds expressive groups with segmented=%s", async (segmented, { page }) => {
  for (const separator of [false, true]) {
    await renderFixture(page, { segmented, separator });
    expect(await readCorners(page)).toEqual([
      ["16px", "16px", "4px", "4px"],
      SMALL,
      ["4px", "4px", "16px", "16px"],
    ]);
    await renderFixture(page, { segmented, separator, count: 1 });
    expect(await readCorners(page)).toEqual([LARGE]);
  }
});

it("keeps hover, focus, pressed and selected shapes authoritative", async ({ page }) => {
  await renderFixture(page);
  const first = page.locator(".q-item").first();
  await first.hover();
  expect((await readCorners(page))[0]).toEqual(HOVER);
  await page.mouse.down();
  expect((await readCorners(page))[0]).toEqual(LARGE);
  await page.mouse.up();
  await page.mouse.move(0, 0);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  expect((await readCorners(page))[0]).toEqual(LARGE);
  await renderFixture(page, { activeIndex: 1 });
  expect((await readCorners(page))[1]).toEqual(LARGE);
});

it("preserves baseline and square list corners", async ({ page }) => {
  await renderFixture(page, { expressive: false });
  expect(await readCorners(page)).toEqual([
    ["16px", "16px", "0px", "0px"],
    ["0px", "0px", "0px", "0px"],
    ["0px", "0px", "16px", "16px"],
  ]);
  await renderFixture(page, { expressive: false, noRound: true });
  expect(await readCorners(page)).toEqual(Array(3).fill(["0px", "0px", "0px", "0px"]));
});

it.for([false, true])(
  "rounds expansion headers with expandIconToggle=%s",
  async (expandIconToggle, { page }) => {
    for (const separator of [false, true]) {
      await renderFixture(page, { itemType: "expansion", expandIconToggle, separator });
      expect(await readCorners(page, EXPANSION_HEADERS)).toEqual([
        ["16px", "16px", "4px", "4px"],
        SMALL,
        ["4px", "4px", "16px", "16px"],
      ]);
      await renderFixture(page, { itemType: "expansion", expandIconToggle, separator, count: 1 });
      expect(await readCorners(page, EXPANSION_HEADERS)).toEqual([LARGE]);
    }

    await renderFixture(page, {
      itemType: "expansion",
      expandIconToggle,
      href: expandIconToggle ? "#details" : undefined,
    });
    await page.locator(".q-expansion-item__item").first().hover();
    expect((await readCorners(page, ".q-expansion-item"))[0]).toEqual(HOVER);
    expect((await readCorners(page, EXPANSION_HEADERS))[0]).toEqual(HOVER);
    await page.mouse.down();
    expect((await readCorners(page, ".q-expansion-item"))[0]).toEqual(LARGE);
    expect((await readCorners(page, EXPANSION_HEADERS))[0]).toEqual(LARGE);
    await page.mouse.up();
    await page.mouse.move(0, 0);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    expect((await readCorners(page, ".q-expansion-item"))[0]).toEqual(LARGE);

    await renderFixture(page, { itemType: "expansion", expandIconToggle, openedIndex: 1 });
    expect((await readCorners(page, ".q-expansion-item"))[1]).toEqual(LARGE);
    expect((await readCorners(page, EXPANSION_HEADERS))[1]).toEqual(["16px", "16px", "4px", "4px"]);
    expect(await readCorners(page, '[aria-label="Nested items"] > .q-item')).toEqual([
      SMALL,
      ["4px", "4px", "16px", "16px"],
    ]);
    await page.getByText("Nested first", { exact: true }).hover();
    expect((await readCorners(page, ".q-expansion-item"))[1]).toEqual(LARGE);
    await renderFixture(page, {
      itemType: "expansion",
      expandIconToggle,
      openedIndex: 1,
      dense: true,
    });
    expect(await readCorners(page, '[aria-label="Nested items"] > .q-item')).toEqual([
      SMALL,
      ["4px", "4px", "16px", "16px"],
    ]);
    await renderFixture(page, { itemType: "expansion", expandIconToggle, noRound: true });
    expect(await readCorners(page, EXPANSION_HEADERS)).toEqual(
      Array(3).fill(["0px", "0px", "0px", "0px"])
    );
    await renderFixture(page, { itemType: "expansion", expandIconToggle, expressive: false });
    expect(await readCorners(page, EXPANSION_HEADERS)).toEqual([
      ["16px", "16px", "0px", "0px"],
      ["0px", "0px", "0px", "0px"],
      ["0px", "0px", "16px", "16px"],
    ]);
    await renderFixture(page, {
      itemType: "expansion",
      expandIconToggle,
      expressive: false,
      openedIndex: 1,
    });
    expect((await readCorners(page, EXPANSION_HEADERS))[1]).toEqual(["16px", "16px", "0px", "0px"]);
  }
);

it("uses the whole mixed list to determine outer corners", async ({ page }) => {
  await renderFixture(page, { itemType: "mixed", count: 4, separator: true });
  expect(
    await readCorners(page, '[aria-label="List shapes"] > :is(.q-item, .q-expansion-item)')
  ).toEqual([["16px", "16px", "4px", "4px"], SMALL, SMALL, ["4px", "4px", "16px", "16px"]]);
});
