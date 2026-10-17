import { expect } from "vitest";
import { settleAnimations } from "../support/animations";
import { createComponentTest } from "../support/browserTest";
import type { Page } from "playwright";

type FocusField = (focused: boolean) => Promise<void>;

const it = createComponentTest({
  component: "field/LabelFixture.svelte",
  stylesheets: [
    "base",
    "shared/field",
    "components/select",
    "components/icon",
    "components/menu",
    "components/list",
  ],
  hasIconFont: true,
  readySelector: ".q-field__input",
  onOpen: (page) => settleAnimations(page.locator(".q-field__wrapper")),
});

async function sampleLabelMotion(page: Page, focused: boolean, finish = true) {
  return page.evaluate(
    async ({ focused, finish }) => {
      const label = document.querySelector<HTMLElement>(".q-field__label-text")!;
      const wrapper = document.querySelector<HTMLElement>(".q-field__wrapper")!;
      const readPosition = () => {
        const rect = label.getBoundingClientRect();
        const style = getComputedStyle(label);

        return {
          x: style.direction === "rtl" ? rect.right : rect.left,
          y: rect.top + parseFloat(style.lineHeight) / 2,
          height: wrapper.getBoundingClientRect().height,
        };
      };
      const before = readPosition();
      await (window.fixture.focusField as FocusField)(focused);
      const animations = wrapper.getAnimations({ subtree: true });

      for (const animation of animations) {
        animation.pause();
        animation.currentTime = 0;
      }

      const start = readPosition();

      for (const animation of animations) {
        animation.currentTime = Number(animation.effect!.getComputedTiming().duration) / 2;
      }

      const middle = readPosition();

      if (finish) {
        for (const animation of animations) {
          animation.finish();
        }
      }

      return { before, start, middle, end: readPosition() };
    },
    { focused, finish }
  );
}

function expectContinuous(result: Awaited<ReturnType<typeof sampleLabelMotion>>) {
  expect(result.start.x).toBeCloseTo(result.before.x, 0);
  expect(result.start.y).toBeCloseTo(result.before.y, 0);
  expect(result.middle.y).toBeGreaterThan(Math.min(result.before.y, result.end.y) + 0.1);
  expect(result.middle.y).toBeLessThan(Math.max(result.before.y, result.end.y) - 0.1);
}

it.for([
  ["default", ""],
  ["filled", "select"],
  ["outlined", ""],
  ["rounded", "select"],
])(
  "animates %s label focus and blur with minified CSS (%s)",
  async ([variant, component], { page, openFixture }) => {
    await openFixture(`variant=${variant}&${component}`);
    const focus = await sampleLabelMotion(page, true);
    expectContinuous(focus);
    expect(focus.end.y).toBeLessThan(focus.before.y - 5);
    expect(focus.middle.height).toBeCloseTo(focus.before.height, 0);
    const blur = await sampleLabelMotion(page, false);
    expectContinuous(blur);
    expect(blur.end.y).toBeCloseTo(focus.before.y, 0);
  }
);

it("keeps RTL label position continuous with a prepend and a rapid reversal", async ({
  page,
  openFixture,
}) => {
  await openFixture("variant=rounded&rtl&prepend");
  const focus = await sampleLabelMotion(page, true, false);
  expect(focus.start.x).toBeCloseTo(focus.before.x, 0);
  expect(focus.start.y).toBeCloseTo(focus.before.y, 0);
  const blur = await sampleLabelMotion(page, false);
  expectContinuous(blur);
  expect(blur.end.x).toBeCloseTo(focus.before.x, 0);
  expect(blur.end.y).toBeCloseTo(focus.before.y, 0);
});

it.for([
  ["outlined", "", 16],
  ["rounded", "rtl&select", 32],
] as const)(
  "floats %s labels to the outer inset with a prepend (%s)",
  async ([variant, query, inset], { page, openFixture }) => {
    await openFixture(`variant=${variant}&${query}&prepend`);
    const wrapper = (await page.locator(".q-field__wrapper").boundingBox())!;
    const focus = await sampleLabelMotion(page, true);
    expectContinuous(focus);
    expect(focus.middle.x).toBeGreaterThan(Math.min(focus.before.x, focus.end.x));
    expect(focus.middle.x).toBeLessThan(Math.max(focus.before.x, focus.end.x));
    const edge = query.includes("rtl") ? wrapper.x + wrapper.width : wrapper.x;
    expect(Math.abs(focus.end.x - edge)).toBeCloseTo(inset, 0);
  }
);

it("keeps enlarged, wrapped labels and input text inside a dense field", async ({
  page,
  openFixture,
}) => {
  await openFixture("variant=outlined&dense&long&size=32");
  await sampleLabelMotion(page, true);
  const geometry = await page.locator(".q-field__wrapper").evaluate((wrapper) => {
    const label = wrapper.querySelector<HTMLElement>(".q-field__label-text")!;
    const input = wrapper.querySelector<HTMLElement>(".q-field__input")!;
    const labelRect = label.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const style = getComputedStyle(label);
    const inputStyle = getComputedStyle(input);

    return {
      labelHeight: labelRect.height,
      lineHeight: parseFloat(style.lineHeight),
      labelBottom: labelRect.bottom,
      inputTextTop:
        inputRect.top +
        parseFloat(inputStyle.paddingTop) +
        (parseFloat(inputStyle.lineHeight) - parseFloat(inputStyle.fontSize)) / 2,
      wrapperHeight: wrapperRect.height,
      contentFits:
        labelRect.left >= wrapperRect.left &&
        labelRect.right <= wrapperRect.right &&
        inputRect.left >= wrapperRect.left &&
        inputRect.right <= wrapperRect.right,
    };
  });
  expect(geometry.labelHeight).toBeGreaterThan(geometry.lineHeight);
  expect(geometry.wrapperHeight).toBeGreaterThan(40);
  expect(geometry.labelBottom).toBeLessThanOrEqual(geometry.inputTextTop + 1);
  expect(geometry.contentFits).toBe(true);
});

it("does not animate label movement when reduced motion is requested", async ({
  page,
  openFixture,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFixture("variant=outlined");
  const focus = await sampleLabelMotion(page, true);
  expect(focus.start.y).toBeCloseTo(focus.end.y, 0);
  const blur = await sampleLabelMotion(page, false);
  expect(blur.start.y).toBeCloseTo(blur.end.y, 0);
});

it.for(["outlined", "rounded"])(
  "keeps inactive %s labels clear of append content",
  async (variant, { page, openFixture }) => {
    await openFixture(`variant=${variant}&long&append`);
    const gap = await page.locator(".q-field__wrapper").evaluate((wrapper) => {
      const label = wrapper.querySelector(".q-field__label-text")!.getBoundingClientRect();
      const append = wrapper.querySelector(".q-field__snippet-append")!.getBoundingClientRect();

      return append.left - label.right;
    });
    expect(gap).toBeGreaterThanOrEqual(15);
    expectContinuous(await sampleLabelMotion(page, true));
    expectContinuous(await sampleLabelMotion(page, false));
  }
);

it.for(["variant=outlined", "variant=rounded&select&rtl", "variant=rounded&value"])(
  "keeps prepend spacing stable before and during hydration (%s)",
  async (query, { page, openFixture }) => {
    await openFixture(`${query}&prepend&ssr`);
    const before = await page.locator(".q-field__label-text").boundingBox();

    if (!query.includes("value")) {
      const gap = await page.locator(".q-field__wrapper").evaluate((wrapper) => {
        const label = wrapper.querySelector(".q-field__label-text")!.getBoundingClientRect();
        const prepend = wrapper.querySelector(".q-field__snippet-prepend")!.getBoundingClientRect();

        return getComputedStyle(wrapper).direction === "rtl"
          ? prepend.left - label.right
          : label.left - prepend.right;
      });
      expect(gap).toBeGreaterThanOrEqual(16);
    }

    await page.evaluate(() => window.hydrateFixture());

    for (const time of [0, 100, 200]) {
      await page.locator(".q-field__wrapper").evaluate((wrapper, time) => {
        for (const animation of wrapper.getAnimations({ subtree: true })) {
          animation.pause();
          animation.currentTime = time;
        }
      }, time);
      const after = await page.locator(".q-field__label-text").boundingBox();
      expect(after!.x).toBeCloseTo(before!.x, 0);
      expect(after!.y).toBeCloseTo(before!.y, 0);
    }
  }
);

it("centers the dropdown arrow beside a wrapped inactive label", async ({ page, openFixture }) => {
  await openFixture("variant=outlined&select&long");
  const wrapper = (await page.locator(".q-field__wrapper").boundingBox())!;
  const arrow = (await page.locator(".q-select__arrow-toggle").boundingBox())!;
  expect(arrow.y + arrow.height / 2).toBeCloseTo(wrapper.y + wrapper.height / 2, 0);
});

it("focuses a narrow select when clicking an enlarged, wrapped label", async ({
  page,
  openFixture,
}) => {
  await openFixture("variant=outlined&select&long&size=32&width=200");
  const point = await page.locator(".q-field__label-text").evaluate((label) => {
    const rect = label.getBoundingClientRect();

    return {
      x: rect.x + rect.width / 2,
      y: rect.bottom - 1.5 * parseFloat(getComputedStyle(label).lineHeight),
    };
  });
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await settleAnimations(page.locator(".q-field__wrapper"));
  await page.mouse.up();
  const input = page.locator(".q-field__input");
  expect(await input.getAttribute("aria-expanded")).toBe("true");
  expect(await input.evaluate((element) => document.activeElement === element)).toBe(true);
});
