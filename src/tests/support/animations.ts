import type { Locator } from "playwright";

/** Waits two frames for pending style changes, then for the animations they started. */
export async function settleAnimations(locator: Locator) {
  await locator.evaluate(async (element) => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(
      element.getAnimations({ subtree: true }).map((animation) => animation.finished)
    );
  });
}
