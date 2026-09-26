import { execFile } from "child_process";
import { cp, mkdtemp, rename, rm, symlink } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { chromium, type Browser, type Page } from "playwright";
import { preview, type PreviewServer } from "vite";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("../../../", import.meta.url));
const fixture = fileURLToPath(new URL("../../../tests/fixtures/rtl/", import.meta.url));
const exec = promisify(execFile);
let directory: string;
let server: PreviewServer;
let browser: Browser;
let page: Page;
let baseUrl: string;

beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "quaff-rtl-"));
  await cp(fixture, directory, { recursive: true });
  await rename(path.join(directory, "svelteConfig.js"), path.join(directory, "svelte.config.js"));
  await rename(path.join(directory, "viteConfig.js"), path.join(directory, "vite.config.js"));
  await symlink(
    path.join(projectRoot, "node_modules"),
    path.join(directory, "node_modules"),
    "junction"
  );
  await exec(process.execPath, [path.join(projectRoot, "node_modules/vite/bin/vite.js"), "build"], {
    cwd: directory,
    env: { ...process.env, NODE_ENV: "production", QUAFF_RTL_TEST_ROOT: projectRoot },
    timeout: 60_000,
    maxBuffer: 4 * 1024 * 1024,
  });
  server = await preview({
    configFile: false,
    root: directory,
    build: { outDir: "build" },
    preview: { host: "127.0.0.1", port: 0 },
  });
  const address = server.httpServer.address();

  if (!address || typeof address === "string") {
    throw new Error("No fixture server address");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch();
}, 75_000);

beforeEach(async () => {
  page = await browser.newPage({ viewport: { width: 1000, height: 700 }, reducedMotion: "reduce" });
});

afterEach(async () => {
  await page?.close();
});

afterAll(async () => {
  await browser?.close();
  await server?.close();

  if (directory) {
    await rm(directory, { recursive: true, force: true });
  }
});

async function open(scene: string, params = "") {
  await page.goto(`${baseUrl}/?scene=${scene}${params}`);
  await page.locator("[data-ready=true]").waitFor();
  await page.evaluate(() => document.fonts.ready);
}

async function direction(selector: string) {
  return page.locator(selector).evaluate((el) => getComputedStyle(el).direction);
}

async function margins() {
  return page.locator(".q-layout__content").evaluate((el) => {
    const style = getComputedStyle(el);
    return [parseFloat(style.marginLeft), parseFloat(style.marginRight)];
  });
}

it("places logical navigation and content on either side while preserving physical placement", async () => {
  await open("navigation");
  await expect.poll(margins).toEqual([80, 224]);
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
  await expect.poll(margins).toEqual([224, 80]);
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
  await expect.poll(margins).toEqual([64, 240]);
  // A child's local override also determines which content edge it occupies.
  await page.locator("#start-drawer").evaluate((el) => el.setAttribute("dir", "rtl"));
  await expect.poll(margins).toEqual([224, 80]);

  await open("navigation", "&physical");
  await expect.poll(margins).toEqual([180, 64]);
  expect((await page.locator("#physical-drawer").boundingBox())!.x).toBeCloseTo(layout.x + 80);
  await page.locator("#scope").evaluate((el) => el.setAttribute("dir", "ltr"));
  await expect.poll(margins).toEqual([164, 80]);
  expect((await page.locator("#physical-drawer").boundingBox())!.x).toBeCloseTo(layout.x + 64);

  await open("drawer-width");
  expect((await page.locator("#relative-drawer").boundingBox())!.width).toBeCloseTo(500);
});

it("opens and closes the mobile drawer from the matching RTL and LTR swipe edge", async () => {
  await open("swipe");
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

it("uses inherited direction on opening, physical anchors and reactive global RTL", async () => {
  await open("overlays");
  await page.locator("#trigger").click();
  const popup = page.locator("#popup");
  await popup.waitFor();
  expect(await direction("#popup")).toBe("rtl");
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
  await expect.poll(() => direction("#popup")).toBe("ltr");
  expect(await popup.getAttribute("lang")).toBe("en");
  await expect
    .poll(async () => (await popup.boundingBox())!.x)
    .toBeCloseTo((await page.locator("#trigger").boundingBox())!.x);

  await open("overlays", "&physical");
  await page.locator("#trigger").click();
  await expect
    .poll(async () => (await popup.boundingBox())?.x)
    .toBeCloseTo((await page.locator("#trigger").boundingBox())!.x);

  // Explicit auto uses the popup's own first strong character, not the LTR trigger.
  await open("overlays", "&dir=ltr&auto");
  await page.locator("#trigger").click();
  await expect.poll(() => direction("#popup")).toBe("rtl");
  expect(await popup.getAttribute("dir")).toBe("auto");
  for (const kind of ["menu", "tooltip"]) {
    await open("overlays", `&global&popup=${kind}`);
    await page.locator("#trigger").click();
    await expect.poll(() => direction("#popup")).toBe("ltr");

    for (const dir of ["rtl", "ltr"]) {
      await page.locator("#toggle-direction").click();
      await expect.poll(() => direction("html")).toBe(dir);
      await expect.poll(() => direction("#popup")).toBe(dir);
      const anchor = (await page.locator("#trigger").boundingBox())!;
      const factor = kind === "tooltip" ? 0.5 : dir === "rtl" ? 1 : 0;
      await expect
        .poll(async () => {
          const box = (await popup.boundingBox())!;
          return box.x + factor * box.width;
        })
        .toBeCloseTo(anchor.x + factor * anchor.width, kind === "tooltip" ? 0 : 2);
    }
  }
});

it("preserves a trigger's CSS direction when global direction differs", async () => {
  for (const popup of ["menu", "tooltip"]) {
    for (const dir of ["ltr", "rtl"]) {
      await open("overlays", `&global=${dir === "rtl" ? "ltr" : "rtl"}&popup=${popup}`);
      expect(await direction("html")).toBe(dir === "rtl" ? "ltr" : "rtl");
      const trigger = page.locator("#trigger");
      await trigger.evaluate((el, value) => (el.style.direction = value), dir);
      await trigger.click();
      await expect.poll(() => direction("#popup")).toBe(dir);
      const anchor = (await trigger.boundingBox())!;
      const factor = popup === "tooltip" ? 0.5 : dir === "rtl" ? 1 : 0;
      await expect
        .poll(async () => {
          const box = (await page.locator("#popup").boundingBox())!;
          return box.x + factor * box.width;
        })
        .toBeCloseTo(anchor.x + factor * anchor.width, popup === "tooltip" ? 0 : 2);
    }
  }
});

it("preserves nested direction for selects and tooltips, including native dialog portals", async () => {
  for (const popup of ["select", "tooltip"]) {
    for (const dir of ["ltr", "rtl"]) {
      await open("overlays", `&popup=${popup}&dir=${dir}&dialog`);
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

it("keeps the logical RTL edge aligned when menu content grows while open", async () => {
  await open("overlays", "&growing");
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
    await open("overlays", `&growing&dir=${dir}`);
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

it("updates open menus and tooltips through explicit reactive direction props", async () => {
  for (const popup of ["menu", "tooltip"]) {
    for (const editable of ["input", "textarea"]) {
      await open("overlays", `&popup=${popup}&editable=${editable}`);
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
          .poll(() => direction("#trigger"), { message: `${editable}: ${value}` })
          .toBe(dir);
        await expect
          .poll(() => direction("#popup"), { message: `${popup}/${editable}: ${value}` })
          .toBe(dir);
        const target = (await trigger.boundingBox())!;
        const expected =
          popup === "tooltip"
            ? target.x + target.width / 2
            : target.x + (dir === "rtl" ? target.width : 0);
        await expect
          .poll(async () => {
            const box = (await page.locator("#popup").boundingBox())!;
            return box.x + (popup === "tooltip" ? box.width / 2 : dir === "rtl" ? box.width : 0);
          })
          .toBeCloseTo(expected);
      }
    }
  }
});

it("mirrors table arrows without swapping next and previous page actions", async () => {
  await open("table");
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

it("mirrors Arabic progress but preserves Hebrew, explicit direction and circular progress", async () => {
  await open("progress");
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

it("accepts static settings and updates reactive RTL, styling and language consistently", async () => {
  await open("configuration", "&static");
  await page.locator("#config-notify").click();
  await expect
    .poll(() =>
      page
        .locator(".q-snackbar__action")
        .evaluate((el) => el.classList.contains("q-btn--expressive"))
    )
    .toBe(true);
  expect(await direction("html")).toBe("rtl");
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

  await open("configuration");
  await page.locator("#config-notify").click();

  for (const expressive of [false, true, false]) {
    await expect.poll(() => direction("html")).toBe(expressive ? "rtl" : "ltr");
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
