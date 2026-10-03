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
const fixture = fileURLToPath(new URL("../../../tests/fixtures/header/", import.meta.url));
const exec = promisify(execFile);
let directory: string;
let server: PreviewServer;
let browser: Browser;
let page: Page;
let baseUrl: string;

beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "quaff-header-"));
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
    env: { ...process.env, NODE_ENV: "production", QUAFF_HEADER_TEST_ROOT: projectRoot },
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

async function open(params = "") {
  await page.goto(`${baseUrl}/?${params}`);
  await page.locator("[data-ready=true]").waitFor();
  await page.evaluate(() => document.fonts.ready);
}

async function height() {
  return (await page.locator("#header").boundingBox())!.height;
}

async function layoutOffset() {
  return page
    .locator(".q-layout__content")
    .evaluate((el) => parseFloat(getComputedStyle(el).marginTop));
}

async function scrollTo(top: number) {
  await page.locator(".q-layout__content").evaluate(async (el, value) => {
    el.scrollTo(0, value);
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  }, top);
}

it("uses the M3 flexible heights and text sizes with and without subtitles", async () => {
  for (const [variant, size, subtitleHeight, titleSize, subtitleSize] of [
    ["small", 64, 64, 22, 12],
    ["medium", 112, 136, 28, 14],
    ["large", 120, 152, 36, 16],
  ] as const) {
    for (const subtitle of [false, true]) {
      await open(`variant=${variant}&standalone${subtitle ? "&subtitle" : ""}`);
      expect(await height()).toBe(subtitle ? subtitleHeight : size);
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

it("keeps decorative images at their own size within the expanded action row", async () => {
  for (const actions of [true, false]) {
    await open(`variant=medium&standalone&logo${actions ? "" : "&no-actions"}`);
    expect(await height()).toBe(112);
    const header = (await page.locator("#header").boundingBox())!;
    const logo = (await page.locator("#logo").boundingBox())!;
    expect([logo.width, logo.height]).toEqual([24, 24]);
    expect(logo.y - header.y).toBe(20);
    expect((await page.locator("#title").boundingBox())!.y - header.y).toBe(64);
  }
});

it("groups trailing actions when the title comes first in either direction", async () => {
  for (const rtl of [false, true]) {
    await open(`variant=medium&standalone&title-first${rtl ? "&rtl" : ""}`);
    const header = (await page.locator("#header").boundingBox())!;
    const save = (await page.locator("#save").boundingBox())!;
    const more = (await page.locator("#more").boundingBox())!;
    const gap = rtl ? save.x - more.x - more.width : more.x - save.x - save.width;
    const edge = rtl ? more.x - header.x : header.x + header.width - more.x - more.width;
    expect(gap).toBe(0);
    expect(edge).toBe(4);
  }
});

it("keeps content aligned while an expandable rail resizes beside a collapsible header", async () => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open("variant=large&rail");
  const content = page.locator(".q-layout__content");
  const rail = page.locator("#rail");
  await page.locator(".q-layout--animated").waitFor();

  for (const width of [256, 80]) {
    await page.locator("#toggle-rail").click();
    await page.locator("#rail.q-railbar--resizing").waitFor();
    const animated = await content.evaluate((el) => getComputedStyle(el).transitionProperty);

    for (const property of ["margin-left", "margin-right", "margin-top", "height"]) {
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

  await scrollTo(120);
  await expect.poll(height).toBe(64);
  await expect.poll(layoutOffset).toBe(64);
});

it("uses distinct leading and trailing icon colors while preserving explicit colors", async () => {
  await open("variant=medium&subtitle&standalone");
  const color = (selector: string) =>
    page.locator(selector).evaluate((el) => getComputedStyle(el).color);
  expect(await color("#back")).toBe(await color("#title"));
  expect(await color("#save")).toBe(await color(".q-header-title__subtitle"));
  expect(await color("#back")).not.toBe(await color("#save"));
  await open("variant=medium&colored&standalone");
  expect(await color("#back")).toBe("rgb(18, 52, 86)");
});

it("collapses until the scroll reaches the top, preserving actions and the subtitle", async () => {
  await open("variant=large&subtitle&border");
  const expanded = await height();
  await expect.poll(layoutOffset).toBe(expanded);
  const save = await page.locator("#save").elementHandle();
  await page.locator("#save").click();
  await scrollTo(400);
  await expect.poll(height).toBeLessThan(expanded);
  await expect.poll(layoutOffset).toBe(await height());
  expect(await save!.evaluate((el) => el.isConnected && el === document.activeElement)).toBe(true);
  expect(await page.locator("#selected").textContent()).toBe("true");
  expect(await page.locator("#title").count()).toBe(1);
  expect(await page.getByText("Weekend collection").isVisible()).toBe(true);
  expect(await page.locator("#title").evaluate((el) => getComputedStyle(el).fontSize)).toBe("22px");
  await scrollTo(100);
  expect(await height()).toBeLessThan(expanded);
  await scrollTo(0);
  await expect.poll(height).toBe(expanded);
  await expect.poll(layoutOffset).toBe(expanded);
  await page.locator("#toggle-header").click();
  await expect.poll(layoutOffset).toBe(0);
});

it("preserves controls and keyboard focus when switching between small and flexible variants", async () => {
  await open("switching&input");
  const input = page.locator("#query");
  const original = await input.elementHandle();
  await input.fill("a draft search");

  for (const expectedHeight of [64, 120, 112]) {
    // Trigger the reactive change without moving focus to the fixture's control.
    await page.locator("#change-variant").evaluate((el) => (el as HTMLButtonElement).click());
    await expect.poll(height).toBe(expectedHeight);
    await expect.poll(layoutOffset).toBe(expectedHeight);
    expect(await original!.evaluate((el) => el.isConnected && el === document.activeElement)).toBe(
      true
    );
    expect(await input.inputValue()).toBe("a draft search");
  }
});

it("changes the scrolled surface independently of optional collapse", async () => {
  for (const variant of ["medium", "large"]) {
    await open(`variant=${variant}&static`);
    await page.locator("#header").evaluate((el) => {
      el.style.setProperty("--surface", "rgb(10, 20, 30)");
      el.style.setProperty("--surface-container", "rgb(40, 50, 60)");
    });
    const expanded = await height();
    const background = () =>
      page.locator("#header").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await background()).toBe("rgb(10, 20, 30)");
    await scrollTo(100);
    expect(await height()).toBe(expanded);
    await expect.poll(background).toBe("rgb(40, 50, 60)");
    await scrollTo(0);
    await expect.poll(background).toBe("rgb(10, 20, 30)");
  }
});

it("keeps short overflowing content stable, including collapse combined with reveal", async () => {
  for (const reveal of [false, true]) {
    await open(`variant=large&subtitle&short${reveal ? "&reveal" : ""}`);

    if (reveal) {
      // Enough overflow to collapse, but hiding the compact bar would erase it.
      await page.locator("#content").evaluate((el) => (el.style.height = "350px"));
    }

    const expanded = await height();
    await expect.poll(layoutOffset).toBe(expanded);
    await scrollTo(1000);
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

it("uses the actual compact height when enlarged text leaves a short scroll range", async () => {
  await page.setViewportSize({ width: 320, height: 700 });
  await open("variant=large&subtitle&long");
  await page.locator("html").evaluate((el) => (el.style.fontSize = "24px"));
  await page.locator("#content").evaluate((el) => (el.style.height = "240px"));
  // Preserve callers' inline longhands while probing compact geometry.
  await page.locator("#header").evaluate((el) => (el.style.transitionDuration = "0s"));
  const expanded = await height();
  await expect.poll(layoutOffset).toBe(expanded);
  await scrollTo(80);
  await expect.poll(height).toBeLessThan(expanded);
  expect(await height()).toBeGreaterThan(64);
  await expect.poll(layoutOffset).toBe(await height());
  expect(await page.locator(".q-layout__content").evaluate((el) => el.scrollTop)).toBeGreaterThan(
    0
  );
  expect(await page.locator("#header").evaluate((el) => el.style.transitionDuration)).toBe("0s");
  await scrollTo(0);
  await expect.poll(height).toBe(expanded);
});

it("grows around enlarged and wrapped text, keeps action targets and mirrors in RTL", async () => {
  await page.setViewportSize({ width: 320, height: 700 });

  for (const rtl of [false, true]) {
    await open(`variant=large&subtitle&long&static${rtl ? "&rtl" : ""}`);
    const normal = await height();
    await page.locator("html").evaluate((el) => (el.style.fontSize = "32px"));
    await expect.poll(height).toBeGreaterThan(normal);
    await expect.poll(layoutOffset).toBe(await height());
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

it("grows small subtitle bars with enlarged text and keeps content below them", async () => {
  for (const width of [1000, 320]) {
    await page.setViewportSize({ width, height: 700 });
    await open("variant=small&subtitle&static");
    await page.locator("html").evaluate((el) => (el.style.fontSize = "32px"));
    await expect.poll(height).toBeGreaterThanOrEqual(104);
    await expect.poll(layoutOffset).toBe(await height());
    const header = (await page.locator("#header").boundingBox())!;
    const title = (await page.locator("#title").boundingBox())!;
    expect(title.y).toBeGreaterThanOrEqual(header.y + 8);
    expect(title.y + title.height).toBeLessThanOrEqual(header.y + header.height - 8);
    expect(await page.locator("#title").evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true
    );
  }
});

it("preserves custom small heights and reveal, and supports centered flexible titles", async () => {
  await open("variant=small&height=96&reveal");
  await expect.poll(height).toBe(96);
  await expect.poll(layoutOffset).toBe(96);
  await scrollTo(400);
  await expect.poll(layoutOffset).toBe(0);
  await scrollTo(100);
  await expect.poll(layoutOffset).toBe(96);
  await open("variant=medium&height=180&center&static");
  await expect.poll(height).toBe(180);
  await expect.poll(layoutOffset).toBe(180);
  expect(await page.locator("#title").evaluate((el) => getComputedStyle(el).textAlign)).toBe(
    "center"
  );
});
