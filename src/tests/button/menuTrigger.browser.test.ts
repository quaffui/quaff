import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest.js";
import type { Locator } from "playwright";

const it = createComponentTest({
  component: "button/MenuTriggerFixture.svelte",
  stylesheets: [
    "base",
    "components/button",
    "components/button-group",
    "components/icon",
    "components/menu",
  ],
  hasIconFont: true,
  readySelector: "#icon-trigger",
  pageOptions: { reducedMotion: "reduce" },
});

function readIconLayout(button: Locator) {
  return button.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const icon = element.querySelector(".q-btn__icon")!.getBoundingClientRect();

    return {
      width: bounds.width,
      height: bounds.height,
      offsetX: icon.x + icon.width / 2 - (bounds.x + bounds.width / 2),
      offsetY: icon.y + icon.height / 2 - (bounds.y + bounds.height / 2),
    };
  });
}

it.for(["standard", "expressive"])(
  "centers the %s icon with a nested menu",
  async (mode, { page, openFixture }) => {
    await openFixture(`ssr&${mode}`);
    const button = page.getByRole("button", { name: "Dark mode" });
    const closed = await readIconLayout(button);
    expect(closed.offsetX).toBeCloseTo(0);
    expect(closed.offsetY).toBeCloseTo(0);

    await page.evaluate(() => window.hydrateFixture());
    await button.click();
    const menu = page.getByRole("menu");
    await expect
      .poll(async () => {
        const bounds = await button.boundingBox();
        const popup = await menu.boundingBox();
        return (
          popup &&
          bounds &&
          Math.abs(popup.x - bounds.x) < 1 &&
          Math.abs(popup.y - bounds.y - bounds.height) < 1
        );
      })
      .toBe(true);

    expect(await readIconLayout(button)).toEqual(closed);
  }
);

it.for(["standard", "expressive"])(
  "preserves wrapping and icon spacing for %s buttons with a label and menu",
  async (mode, { page, openFixture }) => {
    await openFixture(mode);
    await page.evaluate(() => (document.documentElement.style.fontSize = "32px"));
    const labeled = await readIconLayout(page.locator("#labeled-button"));

    expect(
      await page.getByRole("button", { name: "More document actions", exact: true }).count()
    ).toBe(3);
    expect(await readIconLayout(page.locator("#label-and-menu"))).toEqual(labeled);
    expect(await readIconLayout(page.locator("#text-and-menu"))).toEqual(labeled);
  }
);

it("restores the label's layout when snippet text appears or disappears", async ({
  page,
  pageErrors,
  openFixture,
}) => {
  await openFixture();
  const button = page.locator("#icon-trigger");
  const label = button.locator(".q-btn__label");
  const toggle = page.getByRole("button", { name: "Toggle label" });
  await label.waitFor({ state: "hidden" });
  await toggle.click();
  await label.waitFor({ state: "visible" });
  await toggle.click();
  await label.waitFor({ state: "hidden" });
  expect((await readIconLayout(button)).offsetX).toBeCloseTo(0);
  expect(pageErrors).toEqual([]);
});

it("keeps a menu icon centered with a gap utility", async ({ page, openFixture }) => {
  await openFixture("spacing=q-gap-none");
  const icon = await readIconLayout(page.locator("#icon-trigger"));

  expect(icon).toEqual({ width: 52, height: 40, offsetX: 0, offsetY: 0 });
});

it("preserves label wrapping with a horizontal padding utility", async ({ page, openFixture }) => {
  await openFixture("standard&narrow&spacing=q-px-sm");
  const labeled = await readIconLayout(page.locator("#labeled-button"));

  expect(labeled.height).toBe(40);
  expect(await readIconLayout(page.locator("#label-and-menu"))).toEqual(labeled);
  expect(await readIconLayout(page.locator("#text-and-menu"))).toEqual(labeled);
});

it.for([
  { label: "prop", query: "" },
  { label: "snippet", query: "snippet" },
  { label: "snippet with icon", query: "snippet&group-icon" },
])(
  "keeps the grouped $label label wrapped the same way when its neighbor is pressed",
  async ({ query }, { page, openFixture }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openFixture(query);
    const save = page.locator("#save");
    const more = page.locator("#more-actions");
    const resting = (await more.boundingBox())!;

    expect(resting.height).toBe(60);
    await save.hover();
    await page.mouse.down();
    await expect
      .poll(async () => (await more.boundingBox())!.width)
      .toBeLessThan(resting.width - 1);
    await more.evaluate((element) => {
      for (const animation of element.getAnimations()) {
        animation.finish();
      }
    });
    expect((await more.boundingBox())!.height).toBe(resting.height);
    await page.mouse.up();
  }
);
