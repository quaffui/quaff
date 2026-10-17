import { expect } from "vitest";
import { settleAnimations } from "../support/animations";
import { createComponentTest } from "../support/browserTest";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "expansion-item/NestedFixture.svelte",
  stylesheets: ["base", "components/list", "components/expansion-item", "components/icon"],
  readySelector: "#parent",
  onOpen: (page) => settleAnimations(page.locator("main")),
});

it.afterEach(({ pageErrors }) => {
  expect(pageErrors).toEqual([]);
});

async function sampleNestedMotion(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate(async (element) => {
    const ancestors: Element[] = [];

    for (
      let ancestor = element.parentElement?.closest(".q-expansion-item");
      ancestor;
      ancestor = ancestor.parentElement?.closest(".q-expansion-item")
    ) {
      ancestors.push(ancestor);
    }

    const heights: number[] = [];
    let maximumGap = 0;
    const start = performance.now();
    (element.querySelector(":scope > .q-item") as HTMLElement).click();

    while (performance.now() - start < 450) {
      await new Promise(requestAnimationFrame);
      heights.push(
        element.querySelector(":scope > .q-expansion-item__panel")!.getBoundingClientRect().height
      );

      for (const ancestor of ancestors) {
        const panel = ancestor.querySelector(":scope > .q-expansion-item__panel")!;
        const content = panel.querySelector(".q-expansion-item__content")!;
        const gap = panel.getBoundingClientRect().height - content.getBoundingClientRect().height;
        maximumGap = Math.max(maximumGap, Math.abs(gap));
      }
    }

    return { maximumGap, movement: Math.max(...heights) - Math.min(...heights) };
  });
}

it.for([false, true])(
  "keeps open ancestors aligned during nested motion, expressive=%s",
  async (expressive, { page, openFixture }) => {
    await openFixture(expressive ? "" : "standard");

    for (const id of ["child", "grandchild", "grandchild", "child"]) {
      const result = await sampleNestedMotion(page, id);
      expect(result.movement).toBeGreaterThan(5);
      expect(result.maximumGap).toBeLessThan(1);
    }
  }
);

it("animates a parent's first opening and a later reversal", async ({ page, openFixture }) => {
  await openFixture("closed");
  const result = await page.locator("#parent").evaluate(async (element) => {
    const panel = element.querySelector(":scope > .q-expansion-item__panel")!;
    const header = element.querySelector(":scope > .q-item") as HTMLElement;
    const openingHeights: number[] = [];
    header.click();
    const openingStart = performance.now();

    while (performance.now() - openingStart < 450) {
      await new Promise(requestAnimationFrame);
      openingHeights.push(panel.getBoundingClientRect().height);
    }

    const initialHeight = panel.getBoundingClientRect().height;
    const heights: number[] = [];
    header.click();

    for (let frame = 0; frame < 6; frame++) {
      await new Promise(requestAnimationFrame);
      heights.push(panel.getBoundingClientRect().height);
    }

    header.click();
    const start = performance.now();

    while (performance.now() - start < 450) {
      await new Promise(requestAnimationFrame);
    }

    return {
      initialHeight,
      openingHeights,
      heights,
      finalHeight: panel.getBoundingClientRect().height,
    };
  });
  expect(
    result.openingHeights.some((height) => height > 1 && height < result.initialHeight - 1)
  ).toBe(true);
  expect(result.heights.some((height) => height > 1 && height < result.initialHeight - 1)).toBe(
    true
  );
  expect(result.finalHeight).toBeCloseTo(result.initialHeight, 0);
});

it("keeps nested panels aligned with reduced motion", async ({ page, openFixture }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFixture();
  const result = await sampleNestedMotion(page, "child");
  expect(result.maximumGap).toBeLessThan(1);
  expect(result.movement).toBe(0);
});
