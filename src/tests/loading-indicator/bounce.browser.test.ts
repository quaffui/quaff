import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest.js";

const it = createComponentTest({
  component: "loading-indicator/BounceFixture.svelte",
  stylesheets: ["base", "components/loading-indicator"],
  readySelector: ".q-loading-indicator",
});

it("scales the bounce without changing the shape's layout size", async ({ page, openFixture }) => {
  await openFixture();

  const shape = page.getByRole("progressbar").locator(".q-loading-indicator__shape");
  const geometry = await shape.evaluate(async (element) => {
    const bounce = element.getAnimations().find((animation) => {
      return (
        animation instanceof CSSAnimation &&
        animation.animationName === "q-loading-indicator-bounce"
      );
    })!;

    bounce.pause();
    await bounce.ready;
    bounce.currentTime = 260;

    const { width, height, scale } = getComputedStyle(element);
    return { width, height, scale };
  });

  expect(geometry).toEqual({ width: "38px", height: "38px", scale: "1.06" });
});
