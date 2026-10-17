import { expect } from "vitest";
import { settleAnimations } from "../support/animations";
import { createComponentTest } from "../support/browserTest";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "railbar/InteractionFixture.svelte",
  stylesheets: ["components/railbar"],
  readySelector: "#rail",
  pageOptions: { viewport: { width: 800, height: 600 } },
});

it.beforeEach(({ openFixture }) => openFixture());

async function readEvents(page: Page) {
  return JSON.parse((await page.locator("#events").textContent())!);
}

function settle(page: Page) {
  return settleAnimations(page.locator("#rail"));
}

async function sampleWidths(page: Page) {
  return page.locator("#rail").evaluate(async (element) => {
    const transition = element
      .getAnimations()
      .find(
        (animation) =>
          animation instanceof CSSTransition && animation.transitionProperty === "width"
      );

    if (!transition) {
      throw new Error("Expected a rail width transition");
    }

    transition.pause();
    const samples: { rail: number; items: number }[] = [];

    for (const fraction of [0.25, 0.5, 0.75]) {
      transition.currentTime = Number(transition.effect!.getComputedTiming().duration) * fraction;
      // ResizeObserver updates the content width after the animated layout changes.
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      samples.push({
        rail: element.getBoundingClientRect().width,
        items: element.querySelector(".q-railbar__items")!.getBoundingClientRect().width,
      });
    }

    transition.finish();
    return samples;
  });
}

it.for([false, true])(
  "keeps menu sizing in sync while toggling (modal: %s)",
  async (modal, { page }) => {
    if (!modal) {
      await page.locator("#standard").click();
    }

    await page.locator("#expand").click();
    const expanding = await sampleWidths(page);

    for (const sample of expanding) {
      expect(sample.rail).toBeGreaterThan(80);
      expect(sample.rail).toBeLessThan(256);
      expect(sample.items).toBe(232);
    }

    expect(expanding[0].rail).toBeLessThan(expanding.at(-1)!.rail);
    await settle(page);
    await page.locator("#collapse").dispatchEvent("click");
    const samples = await sampleWidths(page);

    for (const sample of samples) {
      expect(sample.rail).toBeGreaterThan(80);
      expect(sample.rail).toBeLessThan(256);
      expect(sample.items).toBeCloseTo(sample.rail, 0);
    }

    expect(samples[0].rail).toBeGreaterThan(samples.at(-1)!.rail);
    await settle(page);
    expect((await page.locator("#rail").boundingBox())!.width).toBe(80);
  }
);

async function expand(page: Page) {
  await page.locator("#expand").click();
  await expect.poll(() => page.locator("#rail").evaluate((el) => el.matches(":modal"))).toBe(true);
  await settle(page);
  expect(await readEvents(page)).toEqual([]);
}

it.for(["Escape", "scrim", "collapse", "external"])(
  "forwards one native close after %s while keeping the collapsed rail visible",
  async (action, { page }) => {
    await expand(page);

    if (action === "Escape") {
      await page.keyboard.press("Escape");
    } else if (action === "scrim") {
      await page.mouse.click(700, 300);
    } else if (action === "external") {
      await page.locator("#rail").evaluate((el) => (el as HTMLDialogElement).close());
    } else {
      await page.locator("#collapse").click();
    }

    await expect
      .poll(() => readEvents(page))
      .toEqual([{ target: true, currentTarget: "rail", expanded: false }]);
    expect(await page.locator("#expanded").textContent()).toBe("false");
    expect(
      await page.locator("#rail").evaluate((el) => [el.hasAttribute("open"), el.matches(":modal")])
    ).toEqual([true, false]);
    expect(await page.locator("#expand").evaluate((el) => document.activeElement === el)).toBe(
      true
    );
  }
);

it("forwards a queued close without collapsing a modal reopened before delivery", async ({
  page,
}) => {
  await expand(page);
  await page.locator("#rail").evaluate((el) => {
    const dialog = el as HTMLDialogElement;
    dialog.close();
    dialog.showModal();
  });
  await expect
    .poll(() => readEvents(page))
    .toEqual([{ target: true, currentTarget: "rail", expanded: true }]);
  expect(await page.locator("#expanded").textContent()).toBe("true");
  expect(await page.locator("#rail").evaluate((el) => el.matches(":modal"))).toBe(true);
});

it("restores navigation attributes and preserves expansion when modal mode ends", async ({
  page,
}) => {
  await expand(page);
  const navigation = page.locator("#rail nav");
  const readAttributes = () =>
    navigation.evaluate((el) =>
      ["aria-describedby", "aria-live", "tabindex"].map((name) => el.getAttribute(name))
    );
  expect(await readAttributes()).toEqual([null, null, null]);
  await page.locator("#standard").click();
  await expect
    .poll(() => readEvents(page))
    .toEqual([{ target: true, currentTarget: "rail", expanded: true }]);
  await expect.poll(readAttributes).toEqual(["description", "polite", "0"]);
  expect(await page.locator("#expanded").textContent()).toBe("true");
});

it("keeps prevented and interrupted dismissals open without close notifications", async ({
  page,
}) => {
  await expand(page);
  await page.locator("#prevent").click();
  await page.keyboard.press("Escape");
  expect(await page.locator("#expanded").textContent()).toBe("true");
  await page.locator("#collapse").click();
  expect(
    await page
      .locator("#rail")
      .evaluate((el) =>
        el
          .getAnimations()
          .some(
            (animation) =>
              animation instanceof CSSTransition && animation.transitionProperty === "width"
          )
      )
  ).toBe(true);
  await page.locator("#expand").dispatchEvent("click");
  await settle(page);
  expect(await readEvents(page)).toEqual([]);
  expect(await page.locator("#rail").evaluate((el) => el.matches(":modal"))).toBe(true);
});

it("releases modality on teardown without notifying a destroyed rail", async ({ page }) => {
  await expand(page);
  await page.locator("#remove").click();
  await page.locator("#rail").waitFor({ state: "detached" });
  await page.locator("#expand").click();
  expect(await readEvents(page)).toEqual([]);
  expect(await page.locator(":modal").count()).toBe(0);
});
