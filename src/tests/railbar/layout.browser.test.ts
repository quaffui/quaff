import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "railbar/LayoutFixture.svelte",
  stylesheets: ["base", "components/layout", "components/railbar"],
  readySelector: "#rail",
  pageOptions: { reducedMotion: "reduce" },
});

async function readLayoutGeometry(page: Page) {
  return page.locator(".q-layout").evaluate((layout) => {
    const rail = layout.querySelector("#rail")!.getBoundingClientRect();
    const content = layout.querySelector(".q-layout__content")!.getBoundingClientRect();

    return { rail: rail.width, contentStart: content.left - layout.getBoundingClientRect().left };
  });
}

it("keeps content beside a rail that its resized layout no longer constrains", async ({
  page,
  openFixture,
}) => {
  await openFixture();
  await expect.poll(() => readLayoutGeometry(page)).toEqual({ rail: 200, contentStart: 200 });

  await page.locator("#frame").evaluate((element) => (element.style.width = "600px"));

  await expect.poll(() => readLayoutGeometry(page)).toEqual({ rail: 256, contentStart: 256 });
});

it("releases layout space when the rail's own style constrains it", async ({
  page,
  openFixture,
}) => {
  await openFixture("width=600");
  await expect.poll(() => readLayoutGeometry(page)).toEqual({ rail: 256, contentStart: 256 });

  await page.locator("#constrain").click();

  await expect.poll(() => readLayoutGeometry(page)).toEqual({ rail: 128, contentStart: 128 });
});
