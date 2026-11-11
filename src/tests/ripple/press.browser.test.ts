import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "ripple/PressFixture.svelte",
  stylesheets: ["base", "components/button", "components/dialog"],
  readySelector: "#press",
  pageOptions: { hasTouch: true, viewport: { width: 1280, height: 720 } },
});

function readRipples(page: Page, button: string) {
  return page.locator(`${button} .q-ripple`).evaluateAll((ripples) =>
    ripples.map((ripple) => ({
      isReleased: (ripple as HTMLElement).style.opacity === "0",
      size: ripple.getBoundingClientRect().width,
    }))
  );
}

it("shows one ripple for a touch tap", async ({ page, openFixture }) => {
  await openFixture();
  const bounds = (await page.locator("#press").boundingBox())!;
  await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

  expect(await readRipples(page, "#press")).toHaveLength(1);
});

it("keeps one ripple while an activation key is held", async ({ page, openFixture }) => {
  await openFixture();
  await page.locator("#press").focus();
  await page.keyboard.down("Space");
  await page.keyboard.down("Space");
  await page.keyboard.down("Space");

  expect(await readRipples(page, "#press")).toEqual([
    expect.objectContaining({ isReleased: false }),
  ]);

  await page.keyboard.up("Space");

  expect(await readRipples(page, "#press")).toEqual([
    expect.objectContaining({ isReleased: true }),
  ]);
});

it("sizes a keyboard ripple to its button instead of the page position", async ({
  page,
  openFixture,
}) => {
  await openFixture();
  const bounds = (await page.locator("#press").boundingBox())!;
  await page.locator("#press").focus();
  await page.keyboard.down("Enter");
  await page.locator("#press .q-ripple").evaluate((ripple) => {
    for (const animation of ripple.getAnimations()) {
      animation.finish();
    }
  });
  const [ripple] = await readRipples(page, "#press");
  await page.keyboard.up("Enter");

  expect(ripple.size).toBeGreaterThanOrEqual(Math.max(bounds.width, bounds.height));
  expect(ripple.size).toBeLessThanOrEqual(Math.hypot(bounds.width, bounds.height) + 1);
});

it("releases the ripple when the pressed key moves focus into a dialog", async ({
  page,
  openFixture,
}) => {
  await openFixture();
  await page.locator("#open").focus();
  await page.keyboard.press("Enter");
  await page.locator("#dialog-action").waitFor();

  expect(await readRipples(page, "#open")).toEqual([expect.objectContaining({ isReleased: true })]);
});
