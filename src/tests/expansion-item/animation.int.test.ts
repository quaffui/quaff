import { chromium, type Browser, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { getCssAsset } from "../assets/cssFixture";

const FIXTURE_PATH = "/expansion-animation-test";
let server: ViteDevServer;
let browser: Browser;
let page: Page;
let errors: string[];

beforeAll(async () => {
  const css = ["base", "components/list", "components/expansion-item", "components/icon"]
    .map(getCssAsset)
    .join("\n");
  const document = `<!doctype html><html><head><link rel="icon" href="data:,">
    <style>${css}</style></head><body><script type="module">
      import { mount } from "svelte";
      import Fixture from "/src/tests/expansion-item/NestedFixture.svelte";
      mount(Fixture, { target: document.body, props: {
        expressive: !location.search.includes("standard"),
        defaultOpened: !location.search.includes("closed")
      }});
    </script></body></html>`;
  server = await createServer({
    mode: "test",
    cacheDir: ".svelte-kit/vite-expansion-animation-test",
    server: { host: "127.0.0.1", port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "expansion-animation-test",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use(async (request, response, next) => {
            if (request.url?.split("?")[0] !== FIXTURE_PATH) {
              return next();
            }

            try {
              const html = await server.transformIndexHtml(FIXTURE_PATH, document);
              response.setHeader("Content-Type", "text/html");
              response.end(html);
            } catch (error) {
              next(error);
            }
          });
        },
      },
    ],
  });
  await server.listen();
  browser = await chromium.launch();
  // Compile the fixture before timing animation frames.
  const warmup = await browser.newPage();
  await warmup.goto(new URL(FIXTURE_PATH, server.resolvedUrls!.local[0]).href);
  await warmup.locator("#parent").waitFor();
  await warmup.close();
}, 30_000);

beforeEach(async () => {
  page = await browser.newPage();
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
});

afterEach(async () => {
  await page?.close();
  expect(errors).toEqual([]);
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function openFixture(expressive = true, defaultOpened = true) {
  const url = new URL(FIXTURE_PATH, server.resolvedUrls!.local[0]);

  if (!expressive) {
    url.searchParams.set("standard", "");
  }

  if (!defaultOpened) {
    url.searchParams.set("closed", "");
  }

  await page.goto(url.href);
  await page.locator("#parent").waitFor();
  await page.locator("main").evaluate(async (element) => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(element.getAnimations({ subtree: true }).map((item) => item.finished));
  });
}

async function sampleNestedMotion(id: string) {
  return page.locator(`#${id}`).evaluate(async (element) => {
    const ancestors: Element[] = [];

    for (
      let ancestor = element.parentElement?.closest(".q-expansion-item");
      ancestor;
      ancestor = ancestor.parentElement?.closest(".q-expansion-item")
    ) {
      ancestors.push(ancestor);
    }

    const heights: number[] = [];
    let maximumGap = 0;
    const start = performance.now();
    (element.querySelector(":scope > .q-item") as HTMLElement).click();

    while (performance.now() - start < 450) {
      await new Promise(requestAnimationFrame);
      heights.push(
        element.querySelector(":scope > .q-expansion-item__panel")!.getBoundingClientRect().height
      );

      for (const ancestor of ancestors) {
        const panel = ancestor.querySelector(":scope > .q-expansion-item__panel")!;
        const content = panel.querySelector(".q-expansion-item__content")!;
        const gap = panel.getBoundingClientRect().height - content.getBoundingClientRect().height;
        maximumGap = Math.max(maximumGap, Math.abs(gap));
      }
    }

    return { maximumGap, movement: Math.max(...heights) - Math.min(...heights) };
  });
}

it.each([false, true])(
  "keeps open ancestors aligned during nested motion, expressive=%s",
  async (expressive) => {
    await openFixture(expressive);

    for (const id of ["child", "grandchild", "grandchild", "child"]) {
      const result = await sampleNestedMotion(id);
      expect(result.movement).toBeGreaterThan(5);
      expect(result.maximumGap).toBeLessThan(1);
    }
  }
);

it("animates a parent's first opening and a later reversal", async () => {
  await openFixture(true, false);
  const result = await page.locator("#parent").evaluate(async (element) => {
    const panel = element.querySelector(":scope > .q-expansion-item__panel")!;
    const header = element.querySelector(":scope > .q-item") as HTMLElement;
    const openingHeights: number[] = [];
    header.click();
    const openingStart = performance.now();

    while (performance.now() - openingStart < 450) {
      await new Promise(requestAnimationFrame);
      openingHeights.push(panel.getBoundingClientRect().height);
    }

    const initialHeight = panel.getBoundingClientRect().height;
    const heights: number[] = [];
    header.click();

    for (let frame = 0; frame < 6; frame++) {
      await new Promise(requestAnimationFrame);
      heights.push(panel.getBoundingClientRect().height);
    }

    header.click();
    const start = performance.now();

    while (performance.now() - start < 450) {
      await new Promise(requestAnimationFrame);
    }

    return {
      initialHeight,
      openingHeights,
      heights,
      finalHeight: panel.getBoundingClientRect().height,
    };
  });
  expect(
    result.openingHeights.some((height) => height > 1 && height < result.initialHeight - 1)
  ).toBe(true);
  expect(result.heights.some((height) => height > 1 && height < result.initialHeight - 1)).toBe(
    true
  );
  expect(result.finalHeight).toBeCloseTo(result.initialHeight, 0);
});

it("keeps nested panels aligned with reduced motion", async () => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFixture();
  const result = await sampleNestedMotion("child");
  expect(result.maximumGap).toBeLessThan(1);
  expect(result.movement).toBe(0);
});
