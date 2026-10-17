import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest";
import type { CDPSession, Locator, Page } from "playwright";

const it = createComponentTest({
  component: "slider/InteractionFixture.svelte",
  stylesheets: ["base", "components/icon", "components/slider"],
  readySelector: "#single",
  pageOptions: { viewport: { width: 900, height: 1100 }, hasTouch: true },
});

it.beforeEach(({ openFixture }) => openFixture());

async function readValue(input: Locator) {
  return Number(await input.inputValue());
}

async function readStopLayout(slider: Locator, isVertical: boolean) {
  return slider.evaluate((element, isVertical) => {
    const bounds = element.querySelector(".q-slider__axis")!.getBoundingClientRect();
    const offsets = [...element.querySelectorAll(".q-slider__stop")]
      .map((stop) => {
        const bounds = stop.getBoundingClientRect();
        return isVertical ? bounds.top : bounds.left;
      })
      .sort((first, second) => first - second);
    const spacings = offsets.slice(1).map((offset, index) => offset - offsets[index]);
    const endSpacings = spacings.slice(-3);

    return {
      count: offsets.length,
      length: isVertical ? bounds.height : bounds.width,
      minimumSpacing: Math.min(...spacings),
      endSpacingVariation: Math.max(...endSpacings) - Math.min(...endSpacings),
    };
  }, isVertical);
}

async function setSliderLength(slider: Locator, isVertical: boolean, length: number) {
  await slider.evaluate(
    (element, { isVertical, length }) => {
      (element as HTMLElement).style[isVertical ? "height" : "width"] = `${length}px`;
    },
    { isVertical, length }
  );
  await expect
    .poll(async () => (await readStopLayout(slider, isVertical)).length)
    .toBe(length - 12);
}

async function readStopTargets(slider: Locator, isReversed = false) {
  await slider.scrollIntoViewIfNeeded();

  return slider.locator(".q-slider__stop").evaluateAll(
    (elements, isReversed) =>
      elements.map((element) => {
        const bounds = element.getBoundingClientRect();
        const position = parseFloat(
          (element as HTMLElement).style.getPropertyValue("--q-slider-position")
        );

        return {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2,
          value: isReversed ? 100 - position : position,
        };
      }),
    isReversed
  );
}

async function expectStopSelection(
  input: Locator,
  stops: Awaited<ReturnType<typeof readStopTargets>>
) {
  for (const stop of stops) {
    await input.press("End");
    await input.page().mouse.click(stop.x, stop.y);
    expect(await readValue(input)).toBeCloseTo(stop.value, 8);
  }
}

async function expectBubbleMotion(
  label: Locator,
  frames: [time: number, scale: number][],
  maxScaleError = 0.02
) {
  const samples = await label.evaluate((element, frames) => {
    const animation = element.getAnimations()[0];
    animation.pause();
    const samples = frames.map(([time]) => {
      animation.currentTime = time;
      const style = getComputedStyle(element);
      return { scale: parseFloat(style.scale), opacity: Number(style.opacity) };
    });
    animation.finish();
    return samples;
  }, frames);
  const largestError = Math.max(
    ...samples.map((sample, index) => Math.abs(sample.scale - frames[index][1]))
  );
  expect(largestError).toBeLessThan(maxScaleError);
  expect(samples.every((sample) => sample.opacity === 1)).toBe(true);
}

async function sendTouch(
  page: Page,
  session: CDPSession,
  type: "touchStart" | "touchMove" | "touchEnd",
  x = 0,
  y = 0
) {
  await session.send("Input.dispatchTouchEvent", {
    type,
    touchPoints: type === "touchEnd" ? [] : [{ x, y }],
  });
  await page.evaluate(() => new Promise(requestAnimationFrame));
}

it.for([false, true])(
  "keeps touch handle drags captured after diagonal movement (vertical: %s)",
  async (isVertical, { page }) => {
    const slider = page.locator(isVertical ? ".vertical" : ".single");
    const handle = (await slider.locator(".q-slider__handle").boundingBox())!;
    const bounds = (await slider.locator(".q-slider__axis").boundingBox())!;
    const x = handle.x + handle.width / 2;
    const y = handle.y + handle.height / 2;
    const session = await page.context().newCDPSession(page);
    await slider.evaluate((element) => {
      element.addEventListener("pointercancel", () => {
        (element as HTMLElement).dataset.cancelled = "true";
      });
    });

    try {
      await sendTouch(page, session, "touchStart", x, y);
      await sendTouch(
        page,
        session,
        "touchMove",
        x + (isVertical ? 18 : 1),
        y - (isVertical ? 1 : 18)
      );
      await sendTouch(
        page,
        session,
        "touchMove",
        isVertical ? x + 60 : bounds.x + bounds.width + 60,
        isVertical ? bounds.y - 60 : y - 60
      );
      await expect.poll(() => readValue(slider.locator("input"))).toBe(100);
      await sendTouch(
        page,
        session,
        "touchMove",
        isVertical ? x + 18 : x + bounds.width / 4,
        isVertical ? y - bounds.height / 4 : y - 18
      );
      await expect.poll(() => readValue(slider.locator("input"))).toBeCloseTo(65, 0);
      await sendTouch(page, session, "touchEnd");
      expect(await slider.getAttribute("data-cancelled")).toBeNull();
      expect(await slider.getAttribute("class")).not.toContain("q-slider--pressed");
    } finally {
      await session.detach();
    }
  }
);

it("preserves track scrolling and lets touches scroll past noninteractive handles", async ({
  page,
}) => {
  const session = await page.context().newCDPSession(page);

  try {
    for (const name of [
      "range",
      "readonly",
      "disabled",
      "readonly-vertical",
      "disabled-vertical",
    ]) {
      const slider = page.locator(`.${name}`);
      await slider.scrollIntoViewIfNeeded();
      const target = name === "range" ? slider : slider.locator(".q-slider__handle");
      const bounds = (await target.boundingBox())!;
      const x = bounds.x + bounds.width / 2;
      const y = bounds.y + bounds.height / 2;
      const initialScroll = await page.evaluate(() => window.scrollY);
      await sendTouch(page, session, "touchStart", x, y);

      for (const distance of [18, 48, 100]) {
        await sendTouch(page, session, "touchMove", x, y - distance);
      }

      await sendTouch(page, session, "touchEnd");
      await expect
        .poll(() => page.evaluate(() => window.scrollY))
        .toBeGreaterThan(initialScroll + 20);
    }

    expect(await page.locator("#range-min").inputValue()).toBe("25");
    expect(await page.locator("#range-max").inputValue()).toBe("75");
  } finally {
    await session.detach();
  }
});

it("smooths shared geometry while updating values immediately, and respects reduced motion", async ({
  page,
  openFixture,
}) => {
  await page.clock.install();
  await openFixture();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  const slider = page.locator(".single");
  const handle = (await slider.locator(".q-slider__handle").boundingBox())!;
  const bounds = (await slider.locator(".q-slider__axis").boundingBox())!;
  const x = handle.x + handle.width / 2;
  const y = handle.y + handle.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await slider.evaluate((element) => {
    window.addEventListener(
      "pointermove",
      () => {
        // Delegated component handlers have run when the event reaches window.
        (element as HTMLElement).dataset.pointerValue = element.querySelector("input")!.value;
      },
      { once: true }
    );
  });
  await page.mouse.move(x + bounds.width / 4, y);
  expect(Number(await slider.getAttribute("data-pointer-value"))).toBeCloseTo(65, 0);
  await page.clock.runFor(32);
  const moving = await readGeometry(slider, false);
  expect(moving.position).toBeGreaterThan(0.4);
  expect(moving.position).toBeLessThan(0.65);

  expect(moving.gaps).toEqual([expect.closeTo(6, 1), expect.closeTo(6, 1)]);

  await page.clock.runFor(250);
  expect((await readGeometry(slider)).position).toBeCloseTo(0.65, 3);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.move(x + bounds.width / 8, y);
  expect((await readGeometry(slider)).position).toBeCloseTo(0.525, 3);
  await page.mouse.up();
  expect(await readValue(slider.locator("input"))).toBeCloseTo(52.5, 0);
});

it("tabs through handles, shows their values and keeps keyboard range adjustments ordered", async ({
  page,
}) => {
  const single = page.locator("#single");
  await page.keyboard.press("Tab");
  expect(await single.evaluate((element) => element === document.activeElement)).toBe(true);
  expect(await page.locator(".single .q-slider__label").getAttribute("class")).toContain("visible");
  await page.keyboard.press("ArrowRight");
  expect(await single.inputValue()).toBe("41");
  await page.keyboard.press("ArrowLeft");
  expect(await single.inputValue()).toBe("40");
  await page.keyboard.press("Tab");
  expect(await page.locator(".single .q-slider__label").getAttribute("class")).not.toContain(
    "visible"
  );
  await page.keyboard.press("Tab");
  const lower = page.locator("#range-min");
  const upper = page.locator("#range-max");
  expect(await lower.evaluate((element) => element === document.activeElement)).toBe(true);
  await lower.press("ArrowRight");
  expect(await lower.inputValue()).toBe("30");
  expect(await upper.getAttribute("min")).toBe("30");
  await lower.press("End");
  expect(await lower.inputValue()).toBe("75");
  await page.keyboard.press("Tab");
  expect(await upper.evaluate((element) => element === document.activeElement)).toBe(true);
  expect(await page.locator(".range .q-slider__label.visible").count()).toBe(1);
  await upper.press("Home");
  expect(await upper.inputValue()).toBe("75");
  await upper.press("ArrowRight");
  expect(await upper.inputValue()).toBe("80");
  expect(await lower.getAttribute("max")).toBe("80");
});

it("uses the same reversed and RTL direction for keyboard and pointer input", async ({ page }) => {
  for (const name of ["rtl", "reversed"]) {
    const input = page.locator(`#${name}`);
    const slider = page.locator(`.${name}`);
    await input.focus();
    await input.press("ArrowRight");
    expect(await input.inputValue()).toBe("39");
    const bounds = (await slider.locator(".q-slider__axis").boundingBox())!;
    await page.mouse.click(bounds.x + bounds.width / 4, bounds.y + bounds.height / 2);
    expect(await input.inputValue()).toBe("75");
  }
});

it("retains read only focus and prevents changes to read only and disabled sliders", async ({
  page,
}) => {
  const readonly = page.locator("#readonly");
  await readonly.focus();
  expect(await readonly.evaluate((element) => element === document.activeElement)).toBe(true);
  await readonly.press("ArrowRight");
  await readonly.press("End");

  for (const name of ["readonly", "disabled"]) {
    const bounds = (await page.locator(`.${name}`).boundingBox())!;
    await page.mouse.click(bounds.x + bounds.width / 4, bounds.y + bounds.height / 2);
    expect(await page.locator(`#${name}`).inputValue()).toBe("40");
  }

  expect(await page.locator("#disabled").isDisabled()).toBe(true);
});

async function readGeometry(slider: Locator, shouldFinishAnimations = true) {
  return slider.evaluate((element, shouldFinishAnimations) => {
    if (shouldFinishAnimations) {
      for (const animation of element.getAnimations({ subtree: true })) {
        animation.finish();
      }
    }

    const handle = element.querySelector(".q-slider__handle")!;
    const axis = element.querySelector(".q-slider__axis")!.getBoundingClientRect();
    const hitTarget = handle.getBoundingClientRect();
    const bar = getComputedStyle(handle, "::before");
    const barWidth = parseFloat(bar.width);
    const center = hitTarget.x + hitTarget.width / 2;
    const segments = [...element.querySelectorAll(".q-slider__segment")]
      .map((segment) => segment.getBoundingClientRect())
      .filter((segment) => segment.width > 0);
    const leading = segments.filter((segment) => segment.right <= center).at(-1)!;
    const trailing = segments.find((segment) => segment.left >= center)!;

    return {
      position: (center - axis.left) / axis.width,
      trackHeight: element.querySelector(".q-slider__track")!.getBoundingClientRect().height,
      barWidth,
      barHeight: parseFloat(bar.height),
      targetWidth: hitTarget.width,
      targetHeight: hitTarget.height,
      gaps: [center - barWidth / 2 - leading.right, trailing.left - center - barWidth / 2],
      shadow: bar.boxShadow,
    };
  }, shouldFinishAnimations);
}

it("selects the visible range handle while its values are animating", async ({
  page,
  openFixture,
}) => {
  await page.clock.install();
  await openFixture();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.locator("#range-max").press("End");
  await page.locator("#range-min").press("End");
  await page.clock.runFor(32);
  const handle = page.locator(".range .q-slider__handle").last();
  const bounds = (await handle.boundingBox())!;
  await handle.hover();
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 10, bounds.y + bounds.height / 2);
  expect(
    await page.locator("#range-max").evaluate((input) => input === document.activeElement)
  ).toBe(true);
  await page.mouse.up();
});

it("grows an opaque value bubble and uses distinct pointer and keyboard exits", async ({
  page,
}) => {
  const slider = page.locator(".single");
  const label = slider.locator(".q-slider__label");
  await slider.locator(".q-slider__handle").hover();
  await page.mouse.down();

  // Scale samples measured from the official M3 drag and Select & arrow clips.
  await expectBubbleMotion(
    label,
    [
      [33.333, 0.164],
      [50, 0.399],
      [66.667, 0.729],
      [100, 0.887],
      [150, 1],
    ],
    3 / 48
  );
  const geometry = await label.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const handle = element.parentElement!;
    const target = handle.getBoundingClientRect();
    const bar = getComputedStyle(handle, "::before");

    return {
      width: bounds.width,
      height: bounds.height,
      gap: target.y + target.height / 2 - parseFloat(bar.height) / 2 - bounds.bottom,
    };
  });
  expect(geometry.width).toBeGreaterThanOrEqual(48);
  expect(geometry.height).toBe(44);
  expect(geometry.gap).toBe(4);
  await page.mouse.up();
  await expectBubbleMotion(label, [
    [50, 0.958],
    [100, 0.917],
    [150, 0.833],
    [200, 0.583],
    [233.333, 0.208],
    [250, 0.104],
    [300, 0],
  ]);

  await page.keyboard.press("ArrowRight");
  await label.evaluate((element) => element.getAnimations()[0].finish());
  await page.keyboard.press("Tab");
  await expectBubbleMotion(label, [
    [33.333, 0.583],
    [50, 0.396],
    [100, 0.125],
    [133.333, 0.042],
    [200, 0],
  ]);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await slider.locator(".q-slider__handle").hover();
  await page.mouse.down();
  expect(await label.evaluate((element) => getComputedStyle(element).scale)).toBe("1");
  await page.mouse.up();
  expect(await label.evaluate((element) => getComputedStyle(element).scale)).toBe("0");
});

it("leaves a 4px neutral gap on centered sliders and keeps stops out of it", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const slider = page.locator(".centered");
  await slider.scrollIntoViewIfNeeded();
  const geometry = await slider.evaluate((element) => {
    const segments = [...element.querySelectorAll(".q-slider__segment")].map((segment) =>
      segment.getBoundingClientRect()
    );
    const hasValidStopPositions = [...element.querySelectorAll(".q-slider__stop")].every((stop) => {
      const bounds = stop.getBoundingClientRect();

      return segments.some(
        (segment) => bounds.left >= segment.left && bounds.right <= segment.right
      );
    });

    return { gap: segments[1].left - segments[0].right, hasValidStopPositions };
  });
  expect(geometry).toEqual({ gap: 4, hasValidStopPositions: true });
  const bounds = (await slider.locator(".q-slider__axis").boundingBox())!;
  const input = slider.locator("input");
  await page.mouse.click(bounds.x + bounds.width * 0.49, bounds.y + bounds.height / 2);

  for (const value of [49, 50, 51]) {
    expect(await readValue(input)).toBe(value);
    const { gaps } = await readGeometry(slider);

    expect(gaps).toEqual([expect.closeTo(6, 1), expect.closeTo(6, 1)]);

    await input.press("ArrowRight");
  }
});

it("matches all five sizes, handle gaps and targets, and only insets icons when they fit", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const SIZE_DIMENSIONS = [
    { size: "xs", track: 16, handle: 44 },
    { size: "sm", track: 24, handle: 44 },
    { size: "md", track: 40, handle: 52 },
    { size: "lg", track: 56, handle: 68 },
    { size: "xl", track: 96, handle: 108 },
  ] as const;

  for (const { size, track, handle } of SIZE_DIMENSIONS) {
    const slider = page.locator(`.geometry-${size}`);
    await slider.scrollIntoViewIfNeeded();

    for (const isPressed of [false, true]) {
      if (isPressed) {
        await slider.locator(".q-slider__handle").hover();
        await page.mouse.down();
      }

      const geometry = await readGeometry(slider);
      expect(geometry.trackHeight).toBe(track);
      expect(geometry.barHeight).toBe(handle);
      expect(geometry.barWidth).toBe(isPressed ? 2 : 4);
      expect(geometry.targetWidth).toBeGreaterThanOrEqual(48);
      expect(geometry.targetHeight).toBeGreaterThanOrEqual(48);
      expect(geometry.shadow).toBe("none");

      expect(geometry.gaps).toEqual([expect.closeTo(6, 1), expect.closeTo(6, 1)]);
    }

    await page.mouse.up();

    if (track < 40) {
      expect(await slider.locator(".q-slider__icon").count()).toBe(0);
      continue;
    }

    const bounds = (await slider.locator(".q-slider__axis").boundingBox())!;
    const cutoff = size === "xl" ? 42 : 32;
    const icon = slider.locator(".q-slider__icon");
    await page.mouse.click(bounds.x + cutoff - 1, bounds.y + bounds.height / 2);
    expect(await icon.getAttribute("class")).not.toMatch(/\bactive\b/);
    await page.mouse.down();
    await page.mouse.move(bounds.x + cutoff + 2, bounds.y + bounds.height / 2);
    await page.mouse.up();
    expect(await icon.getAttribute("class")).toMatch(/\bactive\b/);
    const isIconOnTrack = await slider.evaluate((element) => {
      const icon = element.querySelector(".q-slider__icon")!.getBoundingClientRect();
      const track = element.querySelector(".q-slider__segment.active")!.getBoundingClientRect();

      return icon.left >= track.left && icon.right <= track.right;
    });
    expect(isIconOnTrack).toBe(true);
  }
});

it("outlines the visible handle and keeps stops legible and clear of the handle gap", async ({
  page,
}) => {
  await page.locator("#single").focus();
  await page.locator("#single").press("ArrowRight");
  const focus = await page.locator(".single .q-slider__handle").evaluate((element) => {
    const target = getComputedStyle(element);
    const bar = getComputedStyle(element, "::before");

    return {
      targetOutline: target.outlineStyle,
      barOutline: bar.outlineWidth,
      barOutlineStyle: bar.outlineStyle,
    };
  });
  expect(focus).toEqual({ targetOutline: "none", barOutline: "3px", barOutlineStyle: "solid" });
  const stops = await page.locator(".disabled .q-slider__stop").evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);

      return { opacity: style.opacity, width: style.width, height: style.height };
    })
  );
  expect(stops.length).toBeGreaterThan(0);
  const hasLegibleStops = stops.every(
    (stop) => stop.opacity === "1" && stop.width === "4px" && stop.height === "4px"
  );
  expect(hasLegibleStops).toBe(true);
  const hasValidStopPositions = await page.locator(".dense-markers").evaluate((element) => {
    const segments = [...element.querySelectorAll(".q-slider__segment")].map((segment) =>
      segment.getBoundingClientRect()
    );

    return [...element.querySelectorAll(".q-slider__stop")].every((stop) => {
      const bounds = stop.getBoundingClientRect();

      return segments.some(
        (segment) => bounds.left >= segment.left && bounds.right <= segment.right
      );
    });
  });
  expect(hasValidStopPositions).toBe(true);
});

it.for([false, true])(
  "limits stops after resizing without changing input precision (vertical: %s)",
  async (isVertical, { page }) => {
    const slider = page.locator(isVertical ? ".dense-markers-vertical" : ".dense-markers");

    await slider.locator("input").press(isVertical ? "ArrowUp" : "ArrowRight");
    expect(await readValue(slider.locator("input"))).toBe(isVertical ? 41.1 : 42);

    for (const length of [160, 1000]) {
      await setSliderLength(slider, isVertical, length);
      await expect
        .poll(async () => (await readStopLayout(slider, isVertical)).count)
        .toBeLessThanOrEqual(Math.floor((length - 12) / 8) + 1);
      await expect
        .poll(async () => (await readStopLayout(slider, isVertical)).count)
        .toBeGreaterThan(2);
      await expect
        .poll(async () => (await readStopLayout(slider, isVertical)).minimumSpacing)
        .toBeGreaterThanOrEqual(7.9);
      const layout = await readStopLayout(slider, isVertical);

      expect(layout.length).toBe(length - 12);
      expect(layout.endSpacingVariation).toBeLessThan(0.05);
    }
  }
);

it.for(["horizontal", "vertical", "reversed", "rtl"])(
  "keeps visible ticks aligned with selectable values before and after limiting (%s)",
  async (direction, { page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const slider = page.locator(`.marker-values-${direction}`);
    const input = slider.locator("input");
    const isVertical = direction === "vertical";
    const isReversed = direction === "reversed";

    for (const length of [448, 160]) {
      await setSliderLength(slider, isVertical, length);
      await input.press("End");
      const stops = await readStopTargets(slider, isReversed);
      const interior = stops.filter((stop) => stop.value > 0 && stop.value < 100).slice(0, 2);

      expect(
        stops.every((stop) => Math.abs(stop.value / 2 - Math.round(stop.value / 2)) < 0.0001)
      ).toBe(true);

      if (length === 448) {
        expect(interior.map((stop) => stop.value)).toEqual([expect.closeTo(2), expect.closeTo(4)]);
      }

      await expectStopSelection(input, interior);
    }

    const endpoints = (await readStopTargets(slider, isReversed)).filter(
      (stop) => stop.value === 0 || stop.value === 100
    );
    expect(endpoints.map((stop) => stop.value)).toEqual([0, 100]);
    await expectStopSelection(input, endpoints);
  }
);

it("selects range values at the visible interior ticks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const slider = page.locator(".marker-values-range");
  await setSliderLength(slider, false, 448);
  const input = slider.locator("input").first();
  const stops = (await readStopTargets(slider)).slice(1, 3);

  expect(stops.map((stop) => stop.value)).toEqual([expect.closeTo(2), expect.closeTo(4)]);

  await expectStopSelection(input, stops);
});

it.for([false, true])(
  "keeps vertical icons inset and clear of the handle (reverse: %s)",
  async (isReversed, { page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const slider = page.locator(`.vertical-icon-${isReversed}`);
    await slider.scrollIntoViewIfNeeded();
    const axis = (await slider.locator(".q-slider__axis").boundingBox())!;

    for (const offset of [31, 32.5]) {
      await slider.locator("input").press("Home");
      const y = isReversed ? axis.y + offset : axis.y + axis.height - offset;
      await page.mouse.click(axis.x + axis.width / 2, y);
      const geometry = await readVerticalIconGeometry(slider);

      expect(geometry.isActive).toBe(offset > 32);
      expect(geometry.padding).toBe(6);

      if (geometry.isActive) {
        expect(geometry.clearance).toBeGreaterThanOrEqual(8);
        expect(geometry.isOnTrack).toBe(true);
      }
    }
  }
);

async function readVerticalIconGeometry(slider: Locator) {
  return slider.evaluate((element) => {
    const root = element.getBoundingClientRect();
    const icon = element.querySelector(".q-slider__icon")!;
    const bounds = icon.getBoundingClientRect();
    const handle = element.querySelector(".q-slider__handle")!.getBoundingClientRect();
    const center = handle.y + handle.height / 2;
    const track = element.querySelector(".q-slider__segment.active")!.getBoundingClientRect();
    const isAtEnd = icon.classList.contains("q-slider__icon--end");

    return {
      isActive: icon.classList.contains("active"),
      padding: isAtEnd ? bounds.top - root.top : root.bottom - bounds.bottom,
      clearance: Math.min(Math.abs(bounds.top - center), Math.abs(bounds.bottom - center)),
      isOnTrack: bounds.top >= track.top && bounds.bottom <= track.bottom,
    };
  });
}

it("keeps fine-step stops clear of the inset icon", async ({ page }) => {
  await page.locator(".dense-markers .q-slider__stop").first().waitFor();
  const hasOverlappingStops = await page.locator(".dense-markers").evaluate((element) => {
    const icon = element.querySelector(".q-slider__icon")!.getBoundingClientRect();

    return [...element.querySelectorAll(".q-slider__stop")].some((stop) => {
      const bounds = stop.getBoundingClientRect();
      return bounds.left < icon.right && bounds.right > icon.left;
    });
  });

  expect(hasOverlappingStops).toBe(false);
});
