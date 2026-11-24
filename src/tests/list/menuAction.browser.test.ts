import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest.js";
import type { Locator, Page } from "playwright";

const it = createComponentTest({
  component: "list/MenuActionFixture.svelte",
  stylesheets: ["base", "components/icon", "components/list", "components/menu"],
  readySelector: "main > button",
  hasIconFont: true,
});

const MENU_CASES = [
  { variant: "standard", direction: "ltr", inset: 0, padding: 12, gap: 16 },
  { variant: "standard", direction: "rtl", inset: 0, padding: 12, gap: 16 },
  { variant: "expressive", direction: "ltr", inset: 2, padding: 16, gap: 12 },
  { variant: "expressive", direction: "rtl", inset: 2, padding: 16, gap: 12 },
];

function bounds(locator: Locator) {
  return locator.evaluate((element) => {
    const surface = element.querySelector(":scope > .q-item__action-surface") ?? element;
    const { left, right, top, bottom } = surface.getBoundingClientRect();
    const rtl = getComputedStyle(element.closest(".q-item") ?? element).direction === "rtl";
    return { start: rtl ? -right : left, end: rtl ? -left : right, top, bottom };
  });
}

async function settleMenu(page: Page) {
  await page.getByRole("menu").evaluate(async () => {
    await document.fonts.ready;
    // QMenu positions the popup on the next frame after opening or resizing.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
  });
}

function hoverOpacity(locator: Locator) {
  return locator.evaluate((element) => getComputedStyle(element, "::after").opacity);
}

function samplePixel(page: Page, x: number, y: number) {
  return page.screenshot({ clip: { x, y, width: 1, height: 1 }, scale: "css" });
}

it.for([
  { menuDir: "ltr", rowDir: "rtl", gearDir: "rtl" },
  { menuDir: "ltr", rowDir: "rtl", gearDir: "ltr" },
  { menuDir: "ltr", rowDir: "ltr", gearDir: "rtl" },
  { menuDir: "rtl", rowDir: "ltr", gearDir: "ltr" },
  { menuDir: "rtl", rowDir: "ltr", gearDir: "rtl" },
  { menuDir: "rtl", rowDir: "rtl", gearDir: "ltr" },
])(
  "paints the settings focus ring with menu=$menuDir, row=$rowDir, action=$gearDir",
  async ({ menuDir, rowDir, gearDir }, { page, openFixture }) => {
    await openFixture(`expressive&${menuDir}&style=padding-inline:7px 19px`);
    await page.getByRole("button", { name: "Open menu" }).press("Enter");
    const row = page.locator("#pair");
    const gear = row.getByRole("button", { name: "Settings" });
    await row.evaluate((el, dir) => el.setAttribute("dir", dir), rowDir);
    await gear.evaluate((el, dir) => el.setAttribute("dir", dir), gearDir);
    await settleMenu(page);

    const box = (await row.boundingBox())!;
    const x = Math.floor(box.x + (rowDir === "rtl" ? 1 : box.width - 2));
    const y = Math.floor(box.y + box.height / 2);
    await expectFocusRingAt(page, gear, x, y);
    await page.mouse.click(x, y);
    expect(await page.locator("output").textContent()).toBe("settings ");
  }
);

it.for(["row", "action"])(
  "respects no-pointer-events on the %s across the entire action",
  async (scope, { page, openFixture }) => {
    await openFixture("expressive");
    await page.getByRole("button", { name: "Open menu" }).press("Enter");
    await settleMenu(page);
    const row = page.locator("#pair");
    const gear = row.getByRole("button", { name: "Settings" });
    const target = scope === "row" ? row : gear;
    await target.evaluate((el) => el.classList.add("no-pointer-events"));

    const buttonBox = (await gear.boundingBox())!;
    const rowBox = (await row.boundingBox())!;
    const y = rowBox.y + rowBox.height / 2;
    await page.mouse.click(buttonBox.x + buttonBox.width / 2, y);
    await page.mouse.click(rowBox.x + rowBox.width - 2, y);
    expect(await page.locator("output").textContent()).toBe("");
    await gear.press("Enter");
    expect(await page.locator("output").textContent()).toBe("settings ");
  }
);

it.for(MENU_CASES)(
  "paints and activates the edge while leaving the gap inert ($variant, $direction)",
  async ({ variant, direction }, { page, openFixture }) => {
    await openFixture(`${variant}&${direction}`);
    await page.getByRole("button", { name: "Open menu" }).click();
    await settleMenu(page);
    const row = page.locator("#pair");
    const primary = row.getByRole("button", { name: /English/ });
    const gear = row.getByRole("button", { name: "Settings" });
    const rowBox = (await row.boundingBox())!;
    const primaryBox = (await primary.boundingBox())!;
    const iconBox = (await gear.locator(".q-icon").boundingBox())!;
    const rtl = direction === "rtl";
    const end = rtl ? rowBox.x : rowBox.x + rowBox.width;
    const edgeX = Math.floor(end + (rtl ? 1 : -2));
    const gapStart = rtl ? iconBox.x + iconBox.width : primaryBox.x + primaryBox.width;
    const gapEnd = rtl ? primaryBox.x : iconBox.x;
    const gapX = Math.floor((gapStart + gapEnd) / 2);
    const y = Math.floor(rowBox.y + rowBox.height / 2);

    await page.mouse.move(gapX, y);
    const idleEdge = await samplePixel(page, edgeX, y);
    const idleGap = await samplePixel(page, gapX, y);
    await page.mouse.move(edgeX, y);
    expect(await samplePixel(page, edgeX, y)).not.toEqual(idleEdge);
    expect(await samplePixel(page, gapX, y)).toEqual(idleGap);

    await page.mouse.down();
    expect(await gear.evaluate((button) => document.activeElement === button)).toBe(true);
    const effect = gear.locator(".q-ripple__effect");
    const effectBox = (await effect.boundingBox())!;
    expect(rtl ? effectBox.x : effectBox.x + effectBox.width).toBe(end);
    expect(rtl ? effectBox.x + effectBox.width : effectBox.x).toBe(rtl ? gapStart : gapEnd);
    const wave = (await effect.locator(".q-ripple").boundingBox())!;
    expect(wave.x + wave.width / 2).toBeCloseTo(edgeX, 1);
    expect(wave.y + wave.height / 2).toBeCloseTo(y, 1);
    await page.mouse.up();
    await page.keyboard.press("Enter");
    await page.mouse.click(gapX, y);
    expect(await page.locator("output").textContent()).toBe("settings settings ");
  }
);

it.for(["ltr", "rtl"])(
  "preserves events and positioned content inside the native action (%s)",
  async (direction, { page, openFixture }) => {
    await openFixture(`expressive&${direction}&decorated`);
    await page.getByRole("button", { name: "Open menu" }).click();
    await settleMenu(page);
    const gear = page.getByRole("button", { name: "Settings" });
    const button = (await gear.boundingBox())!;
    const badge = (await gear.locator(".badge").boundingBox())!;
    const endInset =
      direction === "rtl" ? badge.x - button.x : button.x + button.width - badge.x - badge.width;
    expect([endInset, badge.y - button.y]).toEqual([3, 3]);

    await page.getByText("English", { exact: true }).click();
    expect(await page.locator("output").textContent()).toBe("label primary ");
  }
);

it.for(["ltr", "rtl"])(
  "preserves custom grid tracks and a transformed action's native target (%s)",
  async (direction, { page, openFixture }) => {
    await openFixture(
      `expressive&${direction}&style=display:grid;grid-template-columns:1fr 64px;border:1px solid`
    );
    await page.getByRole("button", { name: "Open menu" }).click();
    await settleMenu(page);
    const row = page.locator("#pair");
    const gear = row.getByRole("button", { name: "Settings" });
    const rowBox = await bounds(row);
    expect((await gear.boundingBox())!.width).toBe(64);
    expect((await bounds(gear)).end).toBe(rowBox.end - 1);

    // A transform establishes a new containing block for the state layer.
    await gear.evaluate((button) => {
      button.style.transform = "translateY(0)";
    });
    const button = (await gear.boundingBox())!;
    const surface = await bounds(gear);
    expect(surface.end - surface.start).toBe(button.width);
    expect(surface.bottom - surface.top).toBe(button.height);
    await page.mouse.click(button.x + button.width / 2, button.y + button.height / 2);
    expect(await page.locator("output").textContent()).toBe("settings ");
  }
);

it.for(MENU_CASES)(
  "aligns independent menu actions and their contents ($variant, $direction)",
  async ({ variant, direction, inset, padding, gap }, { page, openFixture }) => {
    await openFixture(`${variant}&${direction}`);
    await page.getByRole("button", { name: "Open menu" }).press("Enter");
    await settleMenu(page);
    const menu = page.getByRole("menu");
    const single = menu.locator("#single button");
    const primary = menu.locator("#pair button").first();
    const settings = menu.getByRole("button", { name: "Settings" });
    const menuBox = await bounds(menu);
    const singleBox = await bounds(single);
    const primaryBox = await bounds(primary);
    const settingsBox = await bounds(settings);
    const pairBox = await bounds(menu.locator("#pair"));

    expect([singleBox.start - menuBox.start, menuBox.end - singleBox.end]).toEqual([inset, inset]);
    expect([primaryBox.start, settingsBox.end]).toEqual([singleBox.start, singleBox.end]);
    expect(settingsBox.start - primaryBox.end).toBe(gap);
    expect([primaryBox.top, primaryBox.bottom]).toEqual([pairBox.top, pairBox.bottom]);
    expect((await bounds(primary.locator(".q-icon"))).start).toBe(
      (await bounds(single.locator(".q-icon"))).start
    );
    expect((await bounds(primary.getByText("English", { exact: true }))).start).toBeCloseTo(
      (await bounds(single.getByText("Single", { exact: true }))).start,
      3
    );
    const iconBox = await bounds(settings.locator(".q-icon"));
    expect(settingsBox.end - iconBox.end).toBe(padding);
    expect([settingsBox.top, settingsBox.bottom]).toEqual([pairBox.top, pairBox.bottom]);
    expect(iconBox.top - settingsBox.top).toBeCloseTo(settingsBox.bottom - iconBox.bottom, 1);

    await settings.focus();
    expect(await settings.evaluate((button) => button.matches(":focus-visible"))).toBe(true);
    await single.focus();
    const x = direction === "rtl" ? -settingsBox.end + 1 : settingsBox.end - 1;
    const y = (settingsBox.top + settingsBox.bottom) / 2;
    await page.mouse.move(x, y);
    expect(await hoverOpacity(settings)).toBe("0.08");
    expect(await hoverOpacity(primary)).toBe("0");
    await page.mouse.click(x, y);
    await primary.click();
    expect(await page.locator("output").textContent()).toBe("settings primary ");

    const ordinary = menu.locator("#ordinary");
    expect(
      (await bounds(ordinary.getByText("Ordinary item", { exact: true }))).start -
        (await bounds(ordinary)).start
    ).toBeCloseTo(padding, 3);
    const outside = page.locator("#outside-item");
    const outsideBox = await bounds(outside);
    expect((await bounds(outside.locator("button"))).start - outsideBox.start).toBeCloseTo(0, 3);
    expect(
      outsideBox.end - (await bounds(outside.getByText("Outside description"))).end
    ).toBeCloseTo(variant === "expressive" ? 16 : 24, 3);
  }
);

it.for(MENU_CASES)(
  "preserves passive content insets as edge actions disappear ($variant, $direction)",
  async ({ variant, direction, padding, gap }, { page, openFixture }) => {
    await page.setViewportSize({ width: 850, height: 800 });
    await openFixture(`${variant}&${direction}`);
    await page.getByRole("button", { name: "Open menu" }).click();
    const mixed = page.locator("#mixed");
    const pin = mixed.getByRole("button", { name: "Pin" });
    const edit = mixed.getByRole("button", { name: "Edit" });
    const content = mixed.locator(":scope > .q-item__section--content").last();
    const description = mixed.locator(":scope > .q-item__section--side").first();

    for (const width of [850, 390, 850]) {
      await page.setViewportSize({ width, height: 800 });
      await settleMenu(page);
      const row = await bounds(mixed);
      expect((await bounds(description)).start - (await bounds(content)).end).toBeCloseTo(gap, 3);
      if (width === 390) {
        expect(await mixed.locator("button").first().isVisible()).toBe(false);
        expect(await mixed.locator("button").last().isVisible()).toBe(false);
        expect((await bounds(mixed.getByText("Details", { exact: true }))).start - row.start).toBe(
          padding
        );
        expect(row.end - (await bounds(mixed.getByText("Available", { exact: true }))).end).toBe(
          padding
        );
      } else {
        const first = await bounds(pin);
        const last = await bounds(edit);
        expect([first.start, last.end]).toEqual([row.start, row.end]);
        expect((await bounds(content)).start - first.end).toBeCloseTo(gap, 3);
        expect(last.start - (await bounds(description)).end).toBeCloseTo(gap, 3);
      }
    }
  }
);

const SPACING_OVERRIDES = [
  { query: "standard", start: 12, end: 12, gap: 16 },
  { query: "standard&spacing=q-px-none", start: 0, end: 0, gap: 16 },
  { query: "expressive&spacing=no-padding", start: 0, end: 0, gap: 12 },
  { query: "expressive&spacing=q-pl-sm", start: 8, end: 16, gap: 12 },
  { query: "expressive&rtl&spacing=q-pl-sm", start: 16, end: 8, gap: 12 },
  { query: "expressive&spacing=q-gap-none", start: 16, end: 16, gap: 0 },
  {
    query: "standard&rtl&style=padding-inline:7px 11px;gap:5px",
    start: 7,
    end: 11,
    gap: 5,
  },
];

async function expectFocusRingAt(page: Page, button: Locator, x: number, y: number) {
  await button.focus();
  expect(await button.evaluate((el) => el.matches(":focus-visible"))).toBe(true);
  const original = await samplePixel(page, x, y);
  await button.evaluate((el) => el.style.setProperty("--secondary", "magenta"));
  expect(await samplePixel(page, x, y)).not.toEqual(original);
  expect(await button.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("none");
  expect(
    await button.evaluate(
      (el, point) => document.elementFromPoint(point.x, point.y)?.closest("button") === el,
      { x, y }
    )
  ).toBe(true);
}

it("keeps the native focus ring on standalone actions and clickable rows", async ({
  page,
  openFixture,
}) => {
  await openFixture("expressive");
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.press("Tab");
  const outside = page.getByRole("button", { name: "Outside action" });
  expect(await outside.evaluate((el) => el.matches(":focus-visible"))).toBe(true);
  expect(await outside.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");

  await trigger.press("Enter");
  const row = page.getByRole("button", { name: "Ordinary item" });
  await row.focus();
  expect(await row.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
});

it.for(SPACING_OVERRIDES)(
  "keeps native content padding and paints the focus ring at the row edges ($query)",
  async ({ query, start, end, gap }, { page, openFixture }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openFixture(query);
    await page.getByRole("button", { name: "Open menu" }).press("Enter");
    await settleMenu(page);
    const menu = page.getByRole("menu");
    const row = menu.locator("#pair");
    const primary = row.locator("button").first();
    const settings = row.locator("button").last();
    const rowBox = await bounds(row);
    const first = await bounds(primary);
    const last = await bounds(settings);
    expect(first.start).toBeCloseTo(rowBox.start, 3);
    expect(last.end).toBeCloseTo(rowBox.end, 3);
    expect(last.start - first.end).toBeCloseTo(gap, 3);
    expect((await bounds(primary.locator(".q-icon"))).start - rowBox.start).toBe(start);
    expect(rowBox.end - (await bounds(settings.locator(".q-icon"))).end).toBe(end);
    expect(await menu.evaluate((el) => el.scrollWidth - el.clientWidth)).toBe(0);
    const rtl = query.includes("rtl");
    const y = Math.floor((rowBox.top + rowBox.bottom) / 2);
    await expectFocusRingAt(
      page,
      primary,
      Math.floor(rtl ? -rowBox.start - 2 : rowBox.start + 1),
      y
    );
    await expectFocusRingAt(page, settings, Math.floor(rtl ? -rowBox.end + 1 : rowBox.end - 2), y);

    const mixed = menu.locator("#mixed");
    const mixedBox = await bounds(mixed);
    expect(await mixed.locator("button:visible").count()).toBe(0);
    expect((await bounds(mixed.getByText("Details"))).start - mixedBox.start).toBe(start);
    expect(mixedBox.end - (await bounds(mixed.getByText("Available"))).end).toBe(end);
  }
);

function readContent(row: Locator) {
  return row.evaluate((element) => {
    const origin = element.getBoundingClientRect();
    // Relative positions can differ by floating-point noise across rows.
    const relativeBox = (rect: DOMRect) =>
      [rect.left - origin.left, rect.top - origin.top, rect.width, rect.height].map((px) =>
        Number(px.toFixed(3))
      );
    const icon = element.querySelector(".q-icon")!;
    const text = document.createRange();
    text.selectNodeContents(element.querySelector(".q-item__section--headline span")!);
    return {
      height: origin.height,
      icon: relativeBox(icon.getBoundingClientRect()),
      lines: Array.from(text.getClientRects(), relativeBox),
    };
  });
}

it.for(MENU_CASES)(
  "keeps ordinary icon and text geometry when a trailing action is hidden ($variant, $direction)",
  async ({ variant, direction }, { page, openFixture }) => {
    await page.setViewportSize({ width: 850, height: 800 });
    await openFixture(`${variant}&${direction}&compare`);
    await page.getByRole("button", { name: "Open menu" }).click();
    const mixed = page.locator("#comparison");
    const edit = mixed.getByRole("button", { name: "Edit" });

    await settleMenu(page);
    expect(await edit.isVisible()).toBe(true);
    await page.setViewportSize({ width: 390, height: 800 });
    await settleMenu(page);
    expect(await edit.isVisible()).toBe(false);
    const reference = await readContent(page.locator("#reference"));
    expect(reference.lines.length).toBeGreaterThan(1);
    expect(await readContent(mixed)).toEqual(reference);

    const edges = page.locator("#edges");
    const row = await bounds(edges);
    expect((await bounds(edges.getByRole("button", { name: "Open", exact: true }))).start).toBe(
      row.start
    );
    expect((await bounds(edges.getByRole("button", { name: "More" }))).end).toBe(row.end);

    await page.setViewportSize({ width: 850, height: 800 });
    await settleMenu(page);
    expect(await edit.isVisible()).toBe(true);
    await edit.evaluate((button) => {
      button.style.display = "none";
    });
    await settleMenu(page);
    expect(await readContent(mixed)).toEqual(await readContent(page.locator("#reference")));
  }
);

it.for(MENU_CASES)(
  "keeps the visible label inset when a leading passive icon hides ($variant, $direction)",
  async ({ variant, direction, padding }, { page, openFixture }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openFixture(`${variant}&${direction}&compare`);
    await page.getByRole("button", { name: "Open menu" }).click();
    await settleMenu(page);
    const ordinary = page.locator("#ordinary");
    const referenceInset =
      (await bounds(ordinary.getByText("Ordinary item"))).start - (await bounds(ordinary)).start;
    const row = page.locator("#hidden-leading");
    const rowBox = await bounds(row);
    expect(referenceInset).toBe(padding);
    expect(await row.locator(".q-icon").isVisible()).toBe(false);
    expect((await bounds(row.getByText("Details"))).start - rowBox.start).toBe(referenceInset);
    expect((await bounds(row.getByRole("button", { name: "Edit" }))).end).toBe(rowBox.end);
  }
);
