import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "ripple/ColorFixture.svelte",
  stylesheets: ["base", "components/button", "components/icon"],
  readySelector: "#theme",
  pageOptions: { viewport: { width: 1280, height: 720 } },
});

async function readRippleColor(page: Page, button: string) {
  await page.locator(button).hover();
  await page.mouse.down();
  const color = await page
    .locator(`${button} .q-ripple`)
    .evaluate((ripple) => getComputedStyle(ripple).backgroundColor);
  await page.mouse.up();

  return color;
}

it("resolves theme color names for the ripple", async ({ page, openFixture }) => {
  await openFixture();
  const tertiary = await page.evaluate(() => {
    const probe = document.body.appendChild(document.createElement("div"));
    probe.style.color = "var(--tertiary)";

    return getComputedStyle(probe).color;
  });

  expect(await readRippleColor(page, "#theme")).toBe(tertiary);
});

it("accepts CSS colors for the ripple", async ({ page, openFixture }) => {
  await openFixture();

  expect(await readRippleColor(page, "#hex")).toBe("rgb(255, 0, 0)");
  expect(await readRippleColor(page, "#function")).toBe("rgb(0, 128, 0)");
});

it("accepts CSS color functions in color props", async ({ page, openFixture }) => {
  await openFixture();
  const color = await page.locator("#icon").evaluate((icon) => getComputedStyle(icon).color);

  expect(color).toBe("oklch(0.628 0.2577 29.23)");
});
