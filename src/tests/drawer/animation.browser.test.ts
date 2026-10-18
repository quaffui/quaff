import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest";
import type { Locator, Page } from "playwright";

const it = createComponentTest({
  component: "drawer/AnimationFixture.svelte",
  stylesheets: ["base", "components/drawer"],
  readySelector: "#toggle-drawer",
  pageOptions: { viewport: { width: 900, height: 600 } },
});

async function settleDrawer(drawer: Locator) {
  await drawer.evaluate(async (element) => {
    await Promise.allSettled(element.getAnimations().map((animation) => animation.finished));
  });
}

async function assertToggleAnimation(page: Page, duration: number) {
  const drawer = page.locator("#drawer");
  await page.locator("#toggle-drawer").click();
  await expect
    .poll(() =>
      drawer.evaluate((element) =>
        element
          .getAnimations()
          .filter(
            (animation) =>
              animation instanceof CSSTransition && animation.transitionProperty === "transform"
          )
          .map((animation) => animation.effect?.getTiming().duration)
      )
    )
    .toEqual([duration]);
  await settleDrawer(drawer);
}

it.for(["", "custom"])(
  "keeps closing and opening animations after width and style changes (%s)",
  async (query, { page, openFixture }) => {
    await openFixture(query);
    const drawer = page.locator("#drawer");
    await expect
      .poll(() => drawer.evaluate((element) => getComputedStyle(element).transitionProperty))
      .toContain("transform");
    const duration = query ? 400 : 300;
    await assertToggleAnimation(page, duration);

    await page.locator("#resize-drawer").click();
    expect(await drawer.evaluate((element) => element.getBoundingClientRect().width)).toBe(280);
    await assertToggleAnimation(page, duration);
    await assertToggleAnimation(page, duration);

    await page.locator("#restyle-drawer").click();
    expect(await drawer.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
      "rgb(1, 2, 3)"
    );
    await assertToggleAnimation(page, duration);
    await assertToggleAnimation(page, duration);
  }
);

it("leaves server-rendered drawers unanimated until mounting", async ({ page, openFixture }) => {
  await openFixture("ssr");
  const drawer = page.locator("#drawer");
  expect(await drawer.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe(
    "0s"
  );
  await page.evaluate(() => window.hydrateFixture());
  await expect
    .poll(() => drawer.evaluate((element) => getComputedStyle(element).transitionProperty))
    .toContain("transform");
  await assertToggleAnimation(page, 300);
});

it.for([false, true])(
  "restores caller transitions after swiping (second pointer: %s)",
  async (hasSecondPointer, { page, openFixture }) => {
    await openFixture("mobile&custom");
    const drawer = page.locator("#drawer");
    const area = page.locator(".q-drawer__swipearea");
    await area.waitFor();
    await page.mouse.move(5, 100);
    await page.mouse.down();
    await page.mouse.move(150, 100, { steps: 5 });
    expect(await drawer.evaluate((element) => element.style.transition)).toBe("none");

    if (hasSecondPointer) {
      await area.dispatchEvent("pointerdown", {
        pointerType: "touch",
        pointerId: 2,
        isPrimary: true,
        buttons: 1,
        clientX: 120,
        clientY: 100,
      });
    }

    await page.mouse.up();
    await expect
      .poll(() => drawer.evaluate((element) => element.classList.contains("q-drawer--active")))
      .toBe(true);
    expect(await drawer.evaluate((element) => element.style.transition)).toBe(
      "transform 0.4s linear"
    );
    await settleDrawer(drawer);
  }
);
