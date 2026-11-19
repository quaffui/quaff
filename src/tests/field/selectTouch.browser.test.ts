import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest.js";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "field/SelectTouchFixture.svelte",
  stylesheets: [
    "base",
    "shared/field",
    "components/select",
    "components/icon",
    "components/menu",
    "components/list",
  ],
  hasIconFont: true,
  readySelector: "[role=combobox]",
  pageOptions: {
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 800 },
  },
});

async function tapValue(page: Page) {
  const input = page.getByRole("combobox", { name: "Location" });
  const bounds = (await input.boundingBox())!;
  const point = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  await page.touchscreen.tap(point.x, point.y);
  return point;
}

it("focuses on the first tap when the open menu covers the select", async ({
  page,
  openFixture,
}) => {
  await openFixture("near-bottom");
  const input = page.getByRole("combobox", { name: "Location" });
  const point = await tapValue(page);

  await expect
    .poll(() =>
      page.evaluate(
        ({ x, y }) => !!document.elementFromPoint(x, y)?.closest(".q-select__menu"),
        point
      )
    )
    .toBe(true);
  expect(await input.evaluate((element) => document.activeElement === element)).toBe(true);

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  expect(await input.inputValue()).toBe("Office");
  expect(await input.getAttribute("aria-expanded")).toBe("false");
});

it.for(["value", "arrow"])(
  "reopens a focused select via its %s without blurring its editor",
  async (trigger, { page, openFixture }) => {
    await openFixture();
    const input = page.getByRole("combobox", { name: "Location" });

    await tapValue(page);
    await page.getByRole("option", { name: "Office" }).tap();
    expect(await input.inputValue()).toBe("Office");

    if (trigger === "value") {
      await tapValue(page);
    } else {
      await page.locator(".q-select__arrow-toggle").tap();
    }

    expect(await input.count()).toBe(1);
    expect(await input.getAttribute("aria-expanded")).toBe("true");
    expect(await input.evaluate((element) => document.activeElement === element)).toBe(true);

    await page.getByRole("button", { name: "Outside editor" }).tap();
    expect(await input.count()).toBe(0);
  }
);

it("suppresses clicks on a disabled select's value", async ({ page, openFixture }) => {
  await openFixture("disabled");
  await tapValue(page);

  expect(await page.locator("#select-clicks").textContent()).toBe("0");
});
