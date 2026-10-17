import { expect } from "vitest";
import { settleAnimations } from "../support/animations";
import { createComponentTest } from "../support/browserTest";
import type { Locator } from "playwright";

const it = createComponentTest({
  component: "button/RadiusFixture.svelte",
  stylesheets: [
    "base",
    "components/button",
    "components/button-group",
    "components/icon",
    "components/toolbar",
  ],
  readySelector: "#wrapped",
  onOpen: (page) => settleAnimations(page.locator("main")),
});

it.beforeEach(({ openFixture }) => openFixture());

async function sampleTransition(button: Locator) {
  return button.evaluate((element) => {
    const animations = element.getAnimations();

    for (const animation of animations) {
      animation.pause();
    }

    // Seek browser animations frame by frame: the bug disappears when they finish.
    const radii: number[] = [];

    for (let step = 0; step <= 20; step++) {
      for (const animation of animations) {
        animation.currentTime =
          (Number(animation.effect!.getComputedTiming().duration) * step) / 20;
      }

      const { width, height } = element.getBoundingClientRect();
      // The top-right corner is the first connected button's animated inner corner.
      const radius = parseFloat(getComputedStyle(element).borderTopRightRadius);
      // Full-pill CSS reports 9999px; visible rounding stops at half the shorter side.
      radii.push(Math.min(radius, width / 2, height / 2));
    }

    for (const animation of animations) {
      animation.finish();
    }

    return {
      count: animations.length,
      start: radii[0],
      middle: radii[Math.floor(radii.length / 2)],
      end: radii.at(-1)!,
      minimum: Math.min(...radii),
    };
  });
}

function expectRounded(
  result: Awaited<ReturnType<typeof sampleTransition>>,
  from: number,
  to: number
) {
  expect(result.count).toBeGreaterThan(0);
  expect(result.minimum).toBeGreaterThan(0);
  expect(result.start).toBeCloseTo(from, 0);
  expect(result.end).toBeCloseTo(to, 0);
  // Reject transitions that stay visually unchanged until the very end.
  expect(Math.abs(result.middle - result.start)).toBeGreaterThan(1);
}

async function expectPressAndRelease(button: Locator, resting: number, pressed: number) {
  const { mouse } = button.page();
  await button.hover();
  await mouse.down();
  expectRounded(await sampleTransition(button), resting, pressed);
  await mouse.up();
  expectRounded(await sampleTransition(button), pressed, resting);
}

it.for([
  { id: "xs", resting: 16, pressed: 8 },
  { id: "sm", resting: 20, pressed: 8 },
  { id: "md", resting: 28, pressed: 12 },
  { id: "lg", resting: 48, pressed: 16 },
  { id: "xl", resting: 68, pressed: 16 },
  { id: "narrow", resting: 16, pressed: 8 },
  { id: "wide", resting: 20, pressed: 8 },
  { id: "connected", resting: 8, pressed: 4 },
  { id: "toolbar", resting: 20, pressed: 8 },
])(
  "keeps $id button corners rounded during press and release",
  async ({ id, resting, pressed }, { page }) => {
    await expectPressAndRelease(page.locator(`#${id}`), resting, pressed);
  }
);

it("animates QBtn while its group resizes it", async ({ page }) => {
  const button = page.locator("#grouped");
  await button.hover();
  await page.mouse.down();
  expect(await button.getAttribute("data-q-btn-group-resizing")).not.toBeNull();
  expectRounded(await sampleTransition(button), 20, 8);
  await page.mouse.up();
  expectRounded(await sampleTransition(button), 8, 20);
});

it("animates selected squared corners when pressed and deselected", async ({ page }) => {
  const button = page.locator("#selected");
  await button.hover();
  await page.mouse.down();
  expectRounded(await sampleTransition(button), 20, 8);
  await page.mouse.up();
  expectRounded(await sampleTransition(button), 8, 12);
  expect(await button.getAttribute("aria-pressed")).toBe("false");
});

it("preserves full rounding when enlarged labels wrap", async ({ page }) => {
  await page.evaluate(() => (document.documentElement.style.fontSize = "32px"));
  const button = page.locator("#wrapped");
  const bounds = (await button.boundingBox())!;
  expect(bounds.height).toBeGreaterThan(40);
  await expectPressAndRelease(button, Math.min(bounds.width, bounds.height) / 2, 8);
});

it("changes corners immediately with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const button = page.locator("#sm");
  await button.hover();
  await page.mouse.down();
  expect(await sampleTransition(button)).toMatchObject({ count: 0, start: 8, end: 8 });
  await page.mouse.up();
  expect(await sampleTransition(button)).toMatchObject({ count: 0, start: 20, end: 20 });
});
