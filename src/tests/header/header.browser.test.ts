import { expect } from "vitest";
import { createAppTest } from "../support/browserTest";
import type { Page } from "playwright";

declare global {
  interface Window {
    resizeObserverErrors: string[];
  }
}

const it = createAppTest({
  app: "header",
  readySelector: "[data-ready=true]",
  pageOptions: { viewport: { width: 1000, height: 700 }, reducedMotion: "reduce" },
});

async function readHeight(page: Page) {
  return (await page.locator("#header").boundingBox())!.height;
}

async function readLayoutOffset(page: Page) {
  return page
    .locator(".q-layout__content")
    .evaluate((el) => parseFloat(getComputedStyle(el).marginTop));
}

async function scrollTo(page: Page, top: number) {
  await page.locator(".q-layout__content").evaluate(async (el, value) => {
    el.scrollTo(0, value);
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  }, top);
}

async function sampleToggleFrames(page: Page, control: string) {
  return page.locator("#header").evaluate(async (header, control) => {
    const title = header.querySelector("#title")!;
    const frames = [];
    document.querySelector<HTMLButtonElement>(control)!.click();

    for (let i = 0; i < 24; i++) {
      await new Promise(requestAnimationFrame);
      const bar = header.getBoundingClientRect();
      const style = getComputedStyle(header, "::after");
      frames.push({
        height: bar.height,
        titleTop: title.getBoundingClientRect().top - bar.top,
        actions: Array.from(header.querySelectorAll(".q-btn, .q-icon"), (el) =>
          el.getBoundingClientRect().toJSON()
        ),
        borderWidth: style.borderBottomWidth,
        borderColor: style.borderBottomColor,
      });
    }

    return frames;
  }, control);
}

it("keeps the title and icons fixed while toggling its border", async ({ page, openFixture }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });

  for (const variant of ["small", "medium", "large"]) {
    await openFixture(`variant=${variant}&standalone`);
    await page.locator("#header").evaluate((el) => {
      el.style.setProperty("--outline-variant", "rgb(40, 50, 60)");
    });
    const before = await readHeight(page);
    const titleTop = await page
      .locator("#title")
      .evaluate(
        (el) => el.getBoundingClientRect().top - el.parentElement!.getBoundingClientRect().top
      );
    const actions = await page
      .locator("#header .q-btn, #header .q-icon")
      .evaluateAll((elements) => elements.map((el) => el.getBoundingClientRect().toJSON()));

    for (const enabled of [true, false]) {
      const frames = await sampleToggleFrames(page, "#toggle-border");

      for (const frame of frames) {
        expect(frame).toEqual(frames[0]);
        expect(frame.actions).toEqual(actions);
        expect(frame.height).toBe(before);
        expect(frame.titleTop).toBe(titleTop);
        expect(frame.borderWidth).toBe(enabled ? "1px" : "0px");

        if (enabled) {
          expect(frame.borderColor).toBe("rgb(40, 50, 60)");
        }
      }
    }
  }
});

it("toggles flexible subtitles without a title jump or delayed resize", async ({
  page,
  openFixture,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });

  for (const [variant, plainHeight, subtitleHeight] of [
    ["medium", 112, 136],
    ["large", 120, 152],
  ] as const) {
    await openFixture(`variant=${variant}&subtitle&standalone`);

    for (const expectedHeight of [plainHeight, subtitleHeight]) {
      const frames = await sampleToggleFrames(page, "#toggle-subtitle");

      for (const frame of frames) {
        expect(frame.height).toBe(expectedHeight);
        expect(frame.titleTop).toBe(64);
      }
    }
  }
});

it("uses the M3 flexible heights and text sizes with and without subtitles", async ({
  page,
  openFixture,
}) => {
  for (const [variant, size, subtitleHeight, titleSize, subtitleSize] of [
    ["small", 64, 64, 22, 12],
    ["medium", 112, 136, 28, 14],
    ["large", 120, 152, 36, 16],
  ] as const) {
    for (const subtitle of [false, true]) {
      await openFixture(`variant=${variant}&standalone${subtitle ? "&subtitle" : ""}`);
      expect(await readHeight(page)).toBe(subtitle ? subtitleHeight : size);
      expect(
        await page.locator("#title").evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
      ).toBe(titleSize);

      if (subtitle) {
        expect(
          await page
            .getByText("Weekend collection")
            .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
        ).toBe(subtitleSize);
      }
    }
  }
});

it("keeps decorative images at their own size within the expanded action row", async ({
  page,
  openFixture,
}) => {
  for (const actions of [true, false]) {
    await openFixture(`variant=medium&standalone&logo${actions ? "" : "&no-actions"}`);
    expect(await readHeight(page)).toBe(112);
    const header = (await page.locator("#header").boundingBox())!;
    const logo = (await page.locator("#logo").boundingBox())!;
    expect([logo.width, logo.height]).toEqual([24, 24]);
    expect(logo.y - header.y).toBe(20);
    expect((await page.locator("#title").boundingBox())!.y - header.y).toBe(64);
  }
});

it("groups trailing actions when the title comes first in either direction", async ({
  page,
  openFixture,
}) => {
  for (const rtl of [false, true]) {
    await openFixture(`variant=medium&standalone&title-first${rtl ? "&rtl" : ""}`);
    const header = (await page.locator("#header").boundingBox())!;
    const save = (await page.locator("#save").boundingBox())!;
    const more = (await page.locator("#more").boundingBox())!;
    const gap = rtl ? save.x - more.x - more.width : more.x - save.x - save.width;
    const edge = rtl ? more.x - header.x : header.x + header.width - more.x - more.width;
    expect(gap).toBe(0);
    expect(edge).toBe(4);
  }
});

it("keeps content aligned while an expandable rail resizes beside a collapsible header", async ({
  page,
  openFixture,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openFixture("variant=large&rail");
  const content = page.locator(".q-layout__content");
  const rail = page.locator("#rail");
  await page.locator(".q-layout--animated").waitFor();

  for (const width of [256, 80]) {
    await page.locator("#toggle-rail").click();
    await page.locator("#rail.q-railbar--resizing").waitFor();
    const animated = await content.evaluate((el) => getComputedStyle(el).transitionProperty);

    for (const property of ["margin-top", "height"]) {
      expect(animated).not.toContain(property);
    }

    await expect.poll(async () => (await rail.boundingBox())!.width).toBe(width);
    await expect
      .poll(async () => {
        const bar = (await rail.boundingBox())!;
        return (await content.boundingBox())!.x - bar.x - bar.width;
      })
      .toBeCloseTo(0);
  }

  await scrollTo(page, 120);
  await expect.poll(() => readHeight(page)).toBe(64);
  await expect.poll(() => readLayoutOffset(page)).toBe(64);
});

it.for(["ltr", "rtl"])(
  "keeps layout aligned during navigation changes (%s)",
  async (dir, { page, openFixture }) => {
    await page.addInitScript(() => {
      window.resizeObserverErrors = [];
      window.addEventListener("error", (event) => {
        if (event.message.includes("ResizeObserver")) {
          window.resizeObserverErrors.push(event.message);
        }
      });
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openFixture(`variant=small&rail&inset&footer&border${dir === "rtl" ? "&rtl" : ""}`);
    await page.locator(".q-layout--animated").waitFor();
    let expanded = false;

    // Switch sides while expanded, with both inset and full-width app bars.
    for (const control of [
      "#toggle-rail",
      "#switch-rail-side",
      "#toggle-inset",
      "#switch-rail-side",
      "#toggle-rail",
      "#toggle-inset",
    ]) {
      const frames = await page.locator("#layout").evaluate(async (layout, control) => {
        const rail = layout.querySelector<HTMLElement>("#rail")!;
        const header = layout.querySelector<HTMLElement>("#header")!;
        const footer = layout.querySelector<HTMLElement>("#footer")!;
        const content = layout.querySelector<HTMLElement>(".q-layout__content")!;
        const frames = [];
        const isRtl = getComputedStyle(rail).direction === "rtl";
        document.querySelector<HTMLButtonElement>(control)!.click();

        for (let frame = 0; frame < 24; frame++) {
          // Read after this frame's layout and resize notifications have completed.
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => setTimeout(resolve, 0));
          });
          const railRect = rail.getBoundingClientRect();
          const layoutRect = layout.getBoundingClientRect();
          const onRight = rail.classList.contains("q-railbar--end") !== isRtl;
          const inset = header.classList.contains("q-header--offset-left");
          const railEdge = onRight ? railRect.left : railRect.right;
          const layoutEdge = onRight ? layoutRect.right : layoutRect.left;
          const barEdge = inset ? railEdge : layoutEdge;
          const measureGap = (element: HTMLElement, edge: number) => {
            const rect = element.getBoundingClientRect();
            return (onRight ? rect.right : rect.left) - edge;
          };
          frames.push({
            width: railRect.width,
            headerGap: measureGap(header, barEdge),
            footerGap: measureGap(footer, barEdge),
            contentGap: measureGap(content, railEdge),
          });
        }

        return frames;
      }, control);

      if (control === "#toggle-rail") {
        expanded = !expanded;
        expect(frames.some((frame) => frame.width > 80 && frame.width < 256)).toBe(true);
      }

      for (const frame of frames) {
        // Layout offsets use offsetWidth, which rounds fractional animation widths.
        expect(Math.abs(frame.headerGap)).toBeLessThanOrEqual(1);
        expect(Math.abs(frame.footerGap)).toBeLessThanOrEqual(1);
        expect(Math.abs(frame.contentGap)).toBeLessThanOrEqual(1);
      }

      await page.locator("#rail:not(.q-railbar--resizing)").waitFor();
      expect((await page.locator("#rail").boundingBox())!.width).toBe(expanded ? 256 : 80);

      for (const bar of ["#header", "#footer"]) {
        const properties = await page
          .locator(bar)
          .evaluate((el) => getComputedStyle(el).transitionProperty);
        expect(properties).toContain("left");
        expect(properties).toContain("right");
      }

      expect(await page.evaluate(() => window.resizeObserverErrors)).toEqual([]);
    }
  }
);

it("uses distinct leading and trailing icon colors while preserving explicit colors", async ({
  page,
  openFixture,
}) => {
  await openFixture("variant=medium&subtitle&standalone");
  const readColor = (selector: string) =>
    page.locator(selector).evaluate((el) => getComputedStyle(el).color);
  expect(await readColor("#back")).toBe(await readColor("#title"));
  expect(await readColor("#save")).toBe(await readColor(".q-header-title__subtitle"));
  expect(await readColor("#back")).not.toBe(await readColor("#save"));
  await openFixture("variant=medium&colored&standalone");
  expect(await readColor("#back")).toBe("rgb(18, 52, 86)");
});

it("collapses until the scroll reaches the top, preserving actions and the subtitle", async ({
  page,
  openFixture,
}) => {
  await openFixture("variant=large&subtitle&border");
  const expanded = await readHeight(page);
  await expect.poll(() => readLayoutOffset(page)).toBe(expanded);
  const save = await page.locator("#save").elementHandle();
  await page.locator("#save").click();
  await scrollTo(page, 400);
  await expect.poll(() => readHeight(page)).toBeLessThan(expanded);
  await expect.poll(() => readLayoutOffset(page)).toBe(await readHeight(page));
  expect(await save!.evaluate((el) => el.isConnected && el === document.activeElement)).toBe(true);
  expect(await page.locator("#selected").textContent()).toBe("true");
  expect(await page.locator("#title").count()).toBe(1);
  expect(await page.getByText("Weekend collection").isVisible()).toBe(true);
  expect(await page.locator("#title").evaluate((el) => getComputedStyle(el).fontSize)).toBe("22px");
  await scrollTo(page, 100);
  expect(await readHeight(page)).toBeLessThan(expanded);
  await scrollTo(page, 0);
  await expect.poll(() => readHeight(page)).toBe(expanded);
  await expect.poll(() => readLayoutOffset(page)).toBe(expanded);
  await page.locator("#toggle-header").click();
  await expect.poll(() => readLayoutOffset(page)).toBe(0);
});

it("preserves controls and keyboard focus when switching between small and flexible variants", async ({
  page,
  openFixture,
}) => {
  await openFixture("switching&input");
  const input = page.locator("#query");
  const original = await input.elementHandle();
  await input.fill("a draft search");

  for (const expectedHeight of [64, 120, 112]) {
    // Trigger the reactive change without moving focus to the fixture's control.
    await page.locator("#change-variant").evaluate((el) => (el as HTMLButtonElement).click());
    await expect.poll(() => readHeight(page)).toBe(expectedHeight);
    await expect.poll(() => readLayoutOffset(page)).toBe(expectedHeight);
    expect(await original!.evaluate((el) => el.isConnected && el === document.activeElement)).toBe(
      true
    );
    expect(await input.inputValue()).toBe("a draft search");
  }
});

it("changes the scrolled surface independently of optional collapse", async ({
  page,
  openFixture,
}) => {
  for (const variant of ["medium", "large"]) {
    await openFixture(`variant=${variant}&static`);
    await page.locator("#header").evaluate((el) => {
      el.style.setProperty("--surface", "rgb(10, 20, 30)");
      el.style.setProperty("--surface-container", "rgb(40, 50, 60)");
    });
    const expanded = await readHeight(page);
    const readBackground = () =>
      page.locator("#header").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await readBackground()).toBe("rgb(10, 20, 30)");
    await scrollTo(page, 100);
    expect(await readHeight(page)).toBe(expanded);
    await expect.poll(readBackground).toBe("rgb(40, 50, 60)");
    await scrollTo(page, 0);
    await expect.poll(readBackground).toBe("rgb(10, 20, 30)");
  }
});

it("keeps short overflowing content stable, including collapse combined with reveal", async ({
  page,
  openFixture,
}) => {
  for (const reveal of [false, true]) {
    await openFixture(`variant=large&subtitle&short${reveal ? "&reveal" : ""}`);

    if (reveal) {
      // Enough overflow to collapse, but hiding the compact bar would erase it.
      await page.locator("#content").evaluate((el) => (el.style.height = "350px"));
    }

    const expanded = await readHeight(page);
    await expect.poll(() => readLayoutOffset(page)).toBe(expanded);
    await scrollTo(page, 1000);
    const samples = await page.locator(".q-layout__content").evaluate(async (el) => {
      const result: number[] = [];

      for (let i = 0; i < 12; i++) {
        await new Promise(requestAnimationFrame);
        result.push(parseFloat(getComputedStyle(el).marginTop));
      }

      return result;
    });
    expect(samples.every((value) => value === expanded)).toBe(true);
    expect(await page.locator(".q-layout__content").evaluate((el) => el.scrollTop)).toBeGreaterThan(
      0
    );
  }
});

it("uses the actual compact height when enlarged text leaves a short scroll range", async ({
  page,
  openFixture,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await openFixture("variant=large&subtitle&long");
  await page.locator("html").evaluate((el) => (el.style.fontSize = "24px"));
  await page.locator("#content").evaluate((el) => (el.style.height = "240px"));
  // Preserve callers' inline longhands while probing compact geometry.
  await page.locator("#header").evaluate((el) => (el.style.transitionDuration = "0s"));
  const expanded = await readHeight(page);
  await expect.poll(() => readLayoutOffset(page)).toBe(expanded);
  await scrollTo(page, 80);
  await expect.poll(() => readHeight(page)).toBeLessThan(expanded);
  expect(await readHeight(page)).toBeGreaterThan(64);
  await expect.poll(() => readLayoutOffset(page)).toBe(await readHeight(page));
  expect(await page.locator(".q-layout__content").evaluate((el) => el.scrollTop)).toBeGreaterThan(
    0
  );
  expect(await page.locator("#header").evaluate((el) => el.style.transitionDuration)).toBe("0s");
  await scrollTo(page, 0);
  await expect.poll(() => readHeight(page)).toBe(expanded);
});

it("grows around enlarged and wrapped text, keeps action targets and mirrors in RTL", async ({
  page,
  openFixture,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });

  for (const rtl of [false, true]) {
    await openFixture(`variant=large&subtitle&long&static${rtl ? "&rtl" : ""}`);
    const normal = await readHeight(page);
    await page.locator("html").evaluate((el) => (el.style.fontSize = "32px"));
    await expect.poll(() => readHeight(page)).toBeGreaterThan(normal);
    await expect.poll(() => readLayoutOffset(page)).toBe(await readHeight(page));
    const header = (await page.locator("#header").boundingBox())!;
    const title = (await page.locator("#title").boundingBox())!;
    expect(title.y + title.height).toBeLessThanOrEqual(header.y + header.height);
    expect(await page.locator("#header").evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true
    );
    const back = (await page.locator("#back").boundingBox())!;
    const save = (await page.locator("#save").boundingBox())!;
    expect(back.width).toBeGreaterThanOrEqual(48);
    expect(back.height).toBeGreaterThanOrEqual(48);
    expect(rtl ? back.x > save.x : back.x < save.x).toBe(true);
  }
});

it("grows small subtitle bars with enlarged text and keeps content below them", async ({
  page,
  openFixture,
}) => {
  for (const width of [1000, 320]) {
    await page.setViewportSize({ width, height: 700 });
    await openFixture("variant=small&subtitle&static");
    await page.locator("html").evaluate((el) => (el.style.fontSize = "32px"));
    await expect.poll(() => readHeight(page)).toBeGreaterThanOrEqual(104);
    await expect.poll(() => readLayoutOffset(page)).toBe(await readHeight(page));
    const header = (await page.locator("#header").boundingBox())!;
    const title = (await page.locator("#title").boundingBox())!;
    expect(title.y).toBeGreaterThanOrEqual(header.y + 8);
    expect(title.y + title.height).toBeLessThanOrEqual(header.y + header.height - 8);
    expect(await page.locator("#title").evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true
    );
  }
});

it("preserves custom small heights and reveal, and supports centered flexible titles", async ({
  page,
  openFixture,
}) => {
  await openFixture("variant=small&height=96&reveal");
  await expect.poll(() => readHeight(page)).toBe(96);
  await expect.poll(() => readLayoutOffset(page)).toBe(96);
  await scrollTo(page, 400);
  await expect.poll(() => readLayoutOffset(page)).toBe(0);
  await scrollTo(page, 100);
  await expect.poll(() => readLayoutOffset(page)).toBe(96);
  await openFixture("variant=medium&height=180&center&static");
  await expect.poll(() => readHeight(page)).toBe(180);
  await expect.poll(() => readLayoutOffset(page)).toBe(180);
  expect(await page.locator("#title").evaluate((el) => getComputedStyle(el).textAlign)).toBe(
    "center"
  );
});
