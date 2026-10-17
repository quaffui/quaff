import { expect } from "vitest";
import { createAppTest } from "../support/browserTest";
import type { Locator, Page } from "playwright";

const it = createAppTest({
  app: "rtl",
  readySelector: "[data-ready=true]",
  pageOptions: { viewport: { width: 1000, height: 700 }, reducedMotion: "reduce" },
});

async function readDirection(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => getComputedStyle(el).direction);
}

// Tooltips center on their trigger; menus align with its inline start edge.
function getAnchorFactor(popup: string, dir: string) {
  if (popup === "tooltip") {
    return 0.5;
  }

  return dir === "rtl" ? 1 : 0;
}

async function readAnchorPosition(locator: Locator, factor: number) {
  const box = (await locator.boundingBox())!;

  return box.x + factor * box.width;
}

async function readContentOffsets(page: Page) {
  return page.locator(".q-layout__content").evaluate((el) => {
    const content = el.getBoundingClientRect();
    const layout = el.parentElement!.getBoundingClientRect();
    return [content.left - layout.left, layout.right - content.right];
  });
}

it("places logical navigation and content on either side while preserving physical placement", async ({
  page,
  openFixture,
}) => {
  await openFixture("scene=navigation");
  await expect.poll(() => readContentOffsets(page)).toEqual([80, 224]);
  const layout = (await page.locator("#layout").boundingBox())!;
  const rail = (await page.locator("#start-rail").boundingBox())!;
  const drawer = (await page.locator("#start-drawer").boundingBox())!;
  expect(rail.x + rail.width).toBeCloseTo(layout.x + layout.width);
  expect(drawer.x + drawer.width).toBeCloseTo(rail.x);
  expect([rail.y, drawer.y]).toEqual([layout.y + 56, layout.y + 56]);
  expect([rail.height, drawer.height]).toEqual([224, 224]);
  expect(
    await page.locator("#start-drawer").evaluate((el) => getComputedStyle(el).borderTopLeftRadius)
  ).toBe("16px");

  await page.locator("#scope").evaluate((el) => el.setAttribute("dir", "ltr"));
  await expect.poll(() => readContentOffsets(page)).toEqual([224, 80]);
  await expect
    .poll(async () => (await page.locator("#start-rail").boundingBox())!.x)
    .toBeCloseTo(layout.x);
  await expect
    .poll(async () => (await page.locator("#start-drawer").boundingBox())!.y)
    .toBeCloseTo(layout.y);
  expect((await page.locator("#start-drawer").boundingBox())!.height).toBeCloseTo(320);
  expect((await page.locator("#start-rail").boundingBox())!.height).toBeCloseTo(320);
  expect(
    await page.locator("#start-drawer").evaluate((el) => getComputedStyle(el).borderTopRightRadius)
  ).toBe("0px");

  // Switching sides releases the old layout space.
  await page.locator("#change-side").click();
  await expect.poll(() => readContentOffsets(page)).toEqual([64, 240]);
  // A child's local override also determines which content edge it occupies.
  await page.locator("#start-drawer").evaluate((el) => el.setAttribute("dir", "rtl"));
  await expect.poll(() => readContentOffsets(page)).toEqual([224, 80]);

  await openFixture("scene=navigation&physical");
  await expect.poll(() => readContentOffsets(page)).toEqual([180, 64]);
  expect((await page.locator("#physical-drawer").boundingBox())!.x).toBeCloseTo(layout.x + 80);
  await page.locator("#scope").evaluate((el) => el.setAttribute("dir", "ltr"));
  await expect.poll(() => readContentOffsets(page)).toEqual([164, 80]);
  expect((await page.locator("#physical-drawer").boundingBox())!.x).toBeCloseTo(layout.x + 64);

  await openFixture("scene=drawer-width");
  expect((await page.locator("#relative-drawer").boundingBox())!.width).toBeCloseTo(500);
});

it("opens and closes the mobile drawer from the matching RTL and LTR swipe edge", async ({
  page,
  openFixture,
}) => {
  await openFixture("scene=swipe");
  const area = page.locator(".q-drawer__swipearea");

  for (const rtl of [true, false]) {
    await page
      .locator("#scope")
      .evaluate((el, value) => el.setAttribute("dir", value), rtl ? "rtl" : "ltr");
    const edge = (await area.boundingBox())!;
    expect(edge.x).toBeCloseTo(rtl ? 980 : 0);
    const start = rtl ? 995 : 5;
    const end = rtl ? 850 : 150;
    await page.mouse.move(start, 100);
    await page.mouse.down();
    await page.mouse.move(end, 100, { steps: 5 });
    await page.mouse.up();
    await expect.poll(() => page.locator("#drawer-open").textContent()).toBe("true");
    await expect
      .poll(async () => (await page.locator("#swipe-drawer").boundingBox())!.x)
      .toBeCloseTo(rtl ? 800 : 0);
    await page.mouse.move(rtl ? 820 : 180, 100);
    await page.mouse.down();
    await page.mouse.move(rtl ? 995 : 5, 100, { steps: 5 });
    await page.mouse.up();
    await expect.poll(() => page.locator("#drawer-open").textContent()).toBe("false");
  }
});

it("uses inherited direction on opening, physical anchors and reactive global RTL", async ({
  page,
  openFixture,
}) => {
  await openFixture("scene=overlays");
  await page.locator("#trigger").click();
  const popup = page.locator("#popup");
  await popup.waitFor();
  expect(await readDirection(page, "#popup")).toBe("rtl");
  expect(await popup.getAttribute("lang")).toBe("ar");
  expect(await popup.evaluate((el) => el.parentElement === document.body)).toBe(true);
  const trigger = (await page.locator("#trigger").boundingBox())!;
  await expect
    .poll(async () => {
      const box = (await popup.boundingBox())!;
      return box.x + box.width;
    })
    .toBeCloseTo(trigger.x + trigger.width);

  await page.keyboard.press("Escape");
  await popup.waitFor({ state: "detached" });
  await page.locator("#scope").evaluate((el) => {
    el.setAttribute("dir", "ltr");
    el.setAttribute("lang", "en");
  });
  await page.locator("#trigger").click();
  await expect.poll(() => readDirection(page, "#popup")).toBe("ltr");
  expect(await popup.getAttribute("lang")).toBe("en");
  await expect
    .poll(async () => (await popup.boundingBox())!.x)
    .toBeCloseTo((await page.locator("#trigger").boundingBox())!.x);

  await openFixture("scene=overlays&physical");
  await page.locator("#trigger").click();
  await expect
    .poll(async () => (await popup.boundingBox())?.x)
    .toBeCloseTo((await page.locator("#trigger").boundingBox())!.x);

  // Explicit auto uses the popup's own first strong character, not the LTR trigger.
  await openFixture("scene=overlays&dir=ltr&auto");
  await page.locator("#trigger").click();
  await expect.poll(() => readDirection(page, "#popup")).toBe("rtl");
  expect(await popup.getAttribute("dir")).toBe("auto");
  for (const kind of ["menu", "tooltip"]) {
    await openFixture(`scene=overlays&global&popup=${kind}`);
    await page.locator("#trigger").click();
    await expect.poll(() => readDirection(page, "#popup")).toBe("ltr");

    for (const dir of ["rtl", "ltr"]) {
      await page.locator("#toggle-direction").click();
      await expect.poll(() => readDirection(page, "html")).toBe(dir);
      await expect.poll(() => readDirection(page, "#popup")).toBe(dir);
      const factor = getAnchorFactor(kind, dir);
      const anchor = await readAnchorPosition(page.locator("#trigger"), factor);
      await expect
        .poll(() => readAnchorPosition(popup, factor))
        .toBeCloseTo(anchor, kind === "tooltip" ? 0 : 2);
    }
  }
});

it("preserves a trigger's CSS direction when global direction differs", async ({
  page,
  openFixture,
}) => {
  for (const popup of ["menu", "tooltip"]) {
    for (const dir of ["ltr", "rtl"]) {
      await openFixture(`scene=overlays&global=${dir === "rtl" ? "ltr" : "rtl"}&popup=${popup}`);
      expect(await readDirection(page, "html")).toBe(dir === "rtl" ? "ltr" : "rtl");
      const trigger = page.locator("#trigger");
      await trigger.evaluate((el, value) => (el.style.direction = value), dir);
      await trigger.click();
      await expect.poll(() => readDirection(page, "#popup")).toBe(dir);
      const factor = getAnchorFactor(popup, dir);
      const anchor = await readAnchorPosition(trigger, factor);
      await expect
        .poll(() => readAnchorPosition(page.locator("#popup"), factor))
        .toBeCloseTo(anchor, popup === "tooltip" ? 0 : 2);
    }
  }
});

it("preserves nested direction for selects and tooltips, including native dialog portals", async ({
  page,
  openFixture,
}) => {
  for (const popup of ["select", "tooltip"]) {
    for (const dir of ["ltr", "rtl"]) {
      await openFixture(`scene=overlays&popup=${popup}&dir=${dir}&dialog`);
      await page
        .locator("html")
        .evaluate((el, value) => el.setAttribute("dir", value), dir === "rtl" ? "ltr" : "rtl");
      await page.locator(popup === "select" ? "#select" : "#trigger").click();
      const overlay = page.locator(popup === "select" ? "[data-quaff-menu]" : "#popup");
      await overlay.waitFor();
      await expect.poll(() => overlay.evaluate((el) => getComputedStyle(el).direction)).toBe(dir);
      expect(await overlay.getAttribute("lang")).toBe("ar");
      expect(await overlay.evaluate((el) => !!el.closest("dialog[open]"))).toBe(true);
    }
  }
});

it("keeps the logical RTL edge aligned when menu content grows while open", async ({
  page,
  openFixture,
}) => {
  await openFixture("scene=overlays&growing");
  await page.locator("#trigger").click();
  const popup = page.locator("#popup");
  const trigger = (await page.locator("#trigger").boundingBox())!;
  const initial = (await popup.boundingBox())!;
  await page.locator("#grow-menu").click();
  await expect
    .poll(async () => (await popup.boundingBox())!.width)
    .toBeGreaterThan(initial.width + 100);
  await expect
    .poll(async () => {
      const box = (await popup.boundingBox())!;
      return box.x + box.width;
    })
    .toBeCloseTo(trigger.x + trigger.width);

  for (const dir of ["rtl", "ltr"]) {
    await openFixture(`scene=overlays&growing&dir=${dir}`);
    await page.locator("#trigger").evaluate((el, rtl) => {
      el.style.cssText = `position: fixed; top: 40px; ${rtl ? "left" : "right"}: 0; margin: 0; width: 140px;`;
    }, dir === "rtl");
    await page.locator("#trigger").click();
    await page.locator("#grow-menu").click();
    await expect
      .poll(async () => {
        const box = (await popup.boundingBox())!;
        return dir === "rtl" ? box.x : box.x + box.width;
      })
      .toBeCloseTo(dir === "rtl" ? 8 : 992);
  }
});

it("updates open menus and tooltips through explicit reactive direction props", async ({
  page,
  openFixture,
}) => {
  for (const popup of ["menu", "tooltip"]) {
    for (const editable of ["input", "textarea"]) {
      await openFixture(`scene=overlays&popup=${popup}&editable=${editable}`);
      const trigger = page.locator("#trigger");
      await trigger.focus();
      await page.locator("#popup").waitFor();

      for (const [value, dir] of [
        ["Hello", "ltr"],
        ["مرحبا", "rtl"],
        ["Hello", "ltr"],
      ]) {
        await trigger.fill(value);
        await expect
          .poll(() => readDirection(page, "#trigger"), { message: `${editable}: ${value}` })
          .toBe(dir);
        await expect
          .poll(() => readDirection(page, "#popup"), { message: `${popup}/${editable}: ${value}` })
          .toBe(dir);
        const factor = getAnchorFactor(popup, dir);
        const anchor = await readAnchorPosition(trigger, factor);
        await expect
          .poll(() => readAnchorPosition(page.locator("#popup"), factor))
          // Browser builds round sub-pixel popup positions differently.
          .toBeCloseTo(anchor, 0);
      }
    }
  }
});

it("mirrors table arrows without swapping next and previous page actions", async ({
  page,
  openFixture,
}) => {
  await openFixture("scene=table");
  const next = page.getByRole("button", { name: "Next page" });
  const previous = page.getByRole("button", { name: "Previous page" });
  expect(await previous.isDisabled()).toBe(true);
  expect(await next.locator(".q-icon").evaluate((el) => getComputedStyle(el).transform)).toBe(
    "matrix(-1, 0, 0, 1, 0, 0)"
  );
  await next.click();
  await expect.poll(() => page.locator("tbody").textContent()).toContain("Row 6");
  expect(await next.isDisabled()).toBe(true);
  await previous.click();
  await expect.poll(() => page.locator("tbody").textContent()).toContain("Row 1");
  await page.locator("#scope").evaluate((el) => el.setAttribute("dir", "ltr"));
  expect(await next.locator(".q-icon").evaluate((el) => getComputedStyle(el).transform)).toBe(
    "none"
  );
});

it("mirrors Arabic progress but preserves Hebrew, explicit direction and circular progress", async ({
  page,
  openFixture,
}) => {
  await openFixture("scene=progress");
  const transforms = await page
    .locator(".q-linear-progress")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
  const FLIPPED = "matrix(-1, 0, 0, 1, 0, 0)";
  expect(transforms).toEqual([FLIPPED, "none", "none", FLIPPED, "none", FLIPPED, "none"]);
  const circles = await page
    .locator(".q-circular-progress__svg")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
  expect(circles[0]).toBe(circles[1]);
  expect(
    await page
      .locator(".q-circular-progress")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).transform))
  ).toEqual(["none", "none"]);
});

it("accepts static settings and updates reactive RTL, styling and language consistently", async ({
  page,
  openFixture,
}) => {
  await openFixture("scene=configuration&static");
  await page.locator("#config-notify").click();
  await expect
    .poll(() =>
      page
        .locator(".q-snackbar__action")
        .evaluate((el) => el.classList.contains("q-btn--expressive"))
    )
    .toBe(true);
  expect(await readDirection(page, "html")).toBe("rtl");
  expect(
    await page
      .locator("#config-button")
      .evaluate((el) => el.classList.contains("q-btn--expressive"))
  ).toBe(true);
  expect(await page.getByRole("button", { name: "Nächste Seite" }).count()).toBe(1);
  expect(
    await page
      .locator("#config-override")
      .evaluate((el) => el.classList.contains("q-btn--expressive"))
  ).toBe(false);

  await openFixture("scene=configuration");
  await page.locator("#config-notify").click();

  for (const expressive of [false, true, false]) {
    await expect.poll(() => readDirection(page, "html")).toBe(expressive ? "rtl" : "ltr");
    await expect
      .poll(() =>
        page.locator("#config-button").evaluate((el) => el.classList.contains("q-btn--expressive"))
      )
      .toBe(expressive);
    expect(
      await page.getByRole("button", { name: expressive ? "Nächste Seite" : "Next page" }).count()
    ).toBe(1);
    expect(
      await page
        .locator("#config-override")
        .evaluate((el) => el.classList.contains("q-btn--expressive"))
    ).toBe(false);
    expect(
      await page
        .locator(".q-snackbar__action")
        .evaluate((el) => el.classList.contains("q-btn--expressive"))
    ).toBe(expressive);
    await page.locator("#config-change").click();
  }
});
