import { chromium, type Browser, type Page } from "playwright";
import { render } from "svelte/server";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { getCssAsset } from "../assets/cssFixture";
import ShapeFixture from "./ShapeFixture.svelte";
import type { ComponentProps } from "svelte";

vi.mock("$app/state", () => ({ page: { url: new URL("https://example.test/") } }));

const SMALL = ["4px", "4px", "4px", "4px"];
const LARGE = ["16px", "16px", "16px", "16px"];
const HOVER = ["12px", "12px", "12px", "12px"];
const EXPANSION_HEADERS = ".q-expansion-item > :is(.q-item, .q-expansion-item__header)";
const css = ["components/list", "components/separator", "components/expansion-item"]
  .map(getCssAsset)
  .join("\n");
let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await chromium.launch();
});

beforeEach(async () => {
  page = await browser.newPage();
});

afterEach(async () => {
  await page?.close();
});

afterAll(async () => {
  await browser?.close();
});

async function openFixture(props: ComponentProps<typeof ShapeFixture> = {}) {
  // Render real components; native CSS states need no client fixture server.
  const { body } = render(ShapeFixture, { props });
  await page.setContent(`<style>${css}</style>${body}`);
  await page.mouse.move(0, 0);
}

async function readCorners(selector = ".q-item") {
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

it.each([false, true])("rounds expressive groups with segmented=%s", async (segmented) => {
  for (const separator of [false, true]) {
    await openFixture({ segmented, separator });
    expect(await readCorners()).toEqual([
      ["16px", "16px", "4px", "4px"],
      SMALL,
      ["4px", "4px", "16px", "16px"],
    ]);
    await openFixture({ segmented, separator, count: 1 });
    expect(await readCorners()).toEqual([LARGE]);
  }
});

it("keeps hover, focus, pressed and selected shapes authoritative", async () => {
  await openFixture();
  const first = page.locator(".q-item").first();
  await first.hover();
  expect((await readCorners())[0]).toEqual(HOVER);
  await page.mouse.down();
  expect((await readCorners())[0]).toEqual(LARGE);
  await page.mouse.up();
  await page.mouse.move(0, 0);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  expect((await readCorners())[0]).toEqual(LARGE);
  await openFixture({ activeIndex: 1 });
  expect((await readCorners())[1]).toEqual(LARGE);
});

it("preserves baseline and square list corners", async () => {
  await openFixture({ expressive: false });
  expect(await readCorners()).toEqual([
    ["16px", "16px", "0px", "0px"],
    ["0px", "0px", "0px", "0px"],
    ["0px", "0px", "16px", "16px"],
  ]);
  await openFixture({ expressive: false, noRound: true });
  expect(await readCorners()).toEqual(Array(3).fill(["0px", "0px", "0px", "0px"]));
});

it.each([false, true])(
  "rounds expansion headers with expandIconToggle=%s",
  async (expandIconToggle) => {
    for (const separator of [false, true]) {
      await openFixture({ itemType: "expansion", expandIconToggle, separator });
      expect(await readCorners(EXPANSION_HEADERS)).toEqual([
        ["16px", "16px", "4px", "4px"],
        SMALL,
        ["4px", "4px", "16px", "16px"],
      ]);
      await openFixture({ itemType: "expansion", expandIconToggle, separator, count: 1 });
      expect(await readCorners(EXPANSION_HEADERS)).toEqual([LARGE]);
    }

    await openFixture({
      itemType: "expansion",
      expandIconToggle,
      href: expandIconToggle ? "#details" : undefined,
    });
    await page.locator(".q-expansion-item__item").first().hover();
    expect((await readCorners(".q-expansion-item"))[0]).toEqual(HOVER);
    expect((await readCorners(EXPANSION_HEADERS))[0]).toEqual(HOVER);
    await page.mouse.down();
    expect((await readCorners(".q-expansion-item"))[0]).toEqual(LARGE);
    expect((await readCorners(EXPANSION_HEADERS))[0]).toEqual(LARGE);
    await page.mouse.up();
    await page.mouse.move(0, 0);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    expect((await readCorners(".q-expansion-item"))[0]).toEqual(LARGE);

    await openFixture({ itemType: "expansion", expandIconToggle, openedIndex: 1 });
    expect((await readCorners(".q-expansion-item"))[1]).toEqual(LARGE);
    expect((await readCorners(EXPANSION_HEADERS))[1]).toEqual(["16px", "16px", "4px", "4px"]);
    expect(await readCorners('[aria-label="Nested items"] > .q-item')).toEqual([
      SMALL,
      ["4px", "4px", "16px", "16px"],
    ]);
    await page.getByText("Nested first", { exact: true }).hover();
    expect((await readCorners(".q-expansion-item"))[1]).toEqual(LARGE);
    await openFixture({ itemType: "expansion", expandIconToggle, openedIndex: 1, dense: true });
    expect(await readCorners('[aria-label="Nested items"] > .q-item')).toEqual([
      SMALL,
      ["4px", "4px", "16px", "16px"],
    ]);
    await openFixture({ itemType: "expansion", expandIconToggle, noRound: true });
    expect(await readCorners(EXPANSION_HEADERS)).toEqual(
      Array(3).fill(["0px", "0px", "0px", "0px"])
    );
    await openFixture({ itemType: "expansion", expandIconToggle, expressive: false });
    expect(await readCorners(EXPANSION_HEADERS)).toEqual([
      ["16px", "16px", "0px", "0px"],
      ["0px", "0px", "0px", "0px"],
      ["0px", "0px", "16px", "16px"],
    ]);
    await openFixture({
      itemType: "expansion",
      expandIconToggle,
      expressive: false,
      openedIndex: 1,
    });
    expect((await readCorners(EXPANSION_HEADERS))[1]).toEqual(["16px", "16px", "0px", "0px"]);
  }
);

it("uses the whole mixed list to determine outer corners", async () => {
  await openFixture({ itemType: "mixed", count: 4, separator: true });
  expect(await readCorners('[aria-label="List shapes"] > :is(.q-item, .q-expansion-item)')).toEqual(
    [["16px", "16px", "4px", "4px"], SMALL, SMALL, ["4px", "4px", "16px", "16px"]]
  );
});
