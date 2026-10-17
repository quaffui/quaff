import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "tooltip/PositionFixture.svelte",
  stylesheets: ["base", "components/tooltip"],
  readySelector: "#trigger",
});

async function readTooltipGap(page: Page) {
  const trigger = (await page.locator("#trigger").boundingBox())!;
  const tooltip = (await page.locator("#tooltip").boundingBox())!;

  return tooltip.y - (trigger.y + trigger.height);
}

it("follows a trigger that resizes while the tooltip is open", async ({ page, openFixture }) => {
  await openFixture();
  await page.locator("#trigger").focus();
  await page.locator("#tooltip").waitFor();
  await expect.poll(() => readTooltipGap(page)).toBeCloseTo(8, 0);

  await page.locator("#trigger").evaluate((element) => (element.style.height = "140px"));

  await expect.poll(() => readTooltipGap(page)).toBeCloseTo(8, 0);
});
