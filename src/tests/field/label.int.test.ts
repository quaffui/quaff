import { transform } from "esbuild";
import { chromium, type Browser, type Page } from "playwright";
import { render } from "svelte/server";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { cssAsset } from "../css/fixture";
import LabelFixture from "./LabelFixture.svelte";

declare global {
  interface Window {
    focusField: (focused: boolean) => Promise<void>;
    hydrateField: () => Promise<void>;
  }
}

let server: ViteDevServer;
let browser: Browser;
let page: Page;

beforeAll(async () => {
  const css = [
    "base",
    "shared/field",
    "components/select",
    "components/icon",
    "components/menu",
    "components/list",
  ]
    .map(cssAsset)
    .join("\n");
  const minified = await transform(css, { loader: "css", minify: true });
  server = await createServer({
    mode: "test",
    cacheDir: ".svelte-kit/vite-field-test",
    server: { host: "127.0.0.1", port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "field-test-fixture",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use((request, response, next) => {
            const path = request.url?.split("?")[0];

            if (path === "/field-test.css") {
              response.setHeader("Content-Type", "text/css");
              response.end(minified.code);
              return;
            }

            if (path !== "/field-test") {
              return next();
            }

            const query = request.url!.split("?")[1] ?? "";
            const ssr = new URLSearchParams(query).has("ssr");
            const body = ssr ? render(LabelFixture, { props: { query } }).body : "";

            void server
              .transformIndexHtml(
                "/field-test",
                `<!doctype html><html><head><link rel="stylesheet" href="/field-test.css">
                <style>
                  @font-face {
                    font-family: "Material Symbols Outlined";
                    src: url("/node_modules/material-symbols/material-symbols-outlined.woff2");
                  }
                </style></head><body>${body}
                <script type="module">
                  import { hydrate, mount, tick } from "svelte";
                  import Fixture, { focusField } from "/src/tests/field/LabelFixture.svelte";
                  window.focusField = focusField;
                  const props = { query: window.location.search };
                  window.hydrateField = async () => {
                    hydrate(Fixture, { target: document.body, props });
                    await tick();
                    await new Promise(requestAnimationFrame);
                    await new Promise(requestAnimationFrame);
                  };
                  if (!new URLSearchParams(props.query).has("ssr")) {
                    mount(Fixture, { target: document.body, props });
                  }
                </script></body></html>`
              )
              .then((html) => {
                response.setHeader("Content-Type", "text/html");
                response.end(html);
              }, next);
          });
        },
      },
    ],
  });
  await server.listen();
  browser = await chromium.launch();
  page = await browser.newPage();
  await load();
  await page.close();
}, 30_000);

beforeEach(async () => {
  page = await browser.newPage();
});

afterEach(async () => {
  await page?.close();
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function load(query = "") {
  await page.goto(`${server.resolvedUrls!.local[0]}field-test?${query}`);
  await page.locator(".q-field__input").waitFor();
  await page.locator(".q-field__wrapper").evaluate(async (wrapper) => {
    await document.fonts.ready;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(
      wrapper.getAnimations({ subtree: true }).map((animation) => animation.finished)
    );
  });
}

async function motion(focused: boolean, finish = true) {
  return page.evaluate(
    async ({ focused, finish }) => {
      const label = document.querySelector<HTMLElement>(".q-field__label-text")!;
      const wrapper = document.querySelector<HTMLElement>(".q-field__wrapper")!;
      const position = () => {
        const rect = label.getBoundingClientRect();
        const style = getComputedStyle(label);

        return {
          x: style.direction === "rtl" ? rect.right : rect.left,
          y: rect.top + parseFloat(style.lineHeight) / 2,
          height: wrapper.getBoundingClientRect().height,
        };
      };
      const before = position();
      await window.focusField(focused);
      const animations = wrapper.getAnimations({ subtree: true });

      for (const animation of animations) {
        animation.pause();
        animation.currentTime = 0;
      }

      const start = position();

      for (const animation of animations) {
        animation.currentTime = Number(animation.effect!.getComputedTiming().duration) / 2;
      }

      const middle = position();

      if (finish) {
        for (const animation of animations) {
          animation.finish();
        }
      }

      return { before, start, middle, end: position() };
    },
    { focused, finish }
  );
}

function expectContinuous(result: Awaited<ReturnType<typeof motion>>) {
  expect(result.start.x).toBeCloseTo(result.before.x, 0);
  expect(result.start.y).toBeCloseTo(result.before.y, 0);
  expect(result.middle.y).toBeGreaterThan(Math.min(result.before.y, result.end.y) + 0.1);
  expect(result.middle.y).toBeLessThan(Math.max(result.before.y, result.end.y) - 0.1);
}

it.each([
  ["default", ""],
  ["filled", "select"],
  ["outlined", ""],
  ["rounded", "select"],
])("animates %s label focus and blur with minified CSS (%s)", async (variant, component) => {
  await load(`variant=${variant}&${component}`);
  const focus = await motion(true);
  expectContinuous(focus);
  expect(focus.end.y).toBeLessThan(focus.before.y - 5);
  expect(focus.middle.height).toBeCloseTo(focus.before.height, 0);
  const blur = await motion(false);
  expectContinuous(blur);
  expect(blur.end.y).toBeCloseTo(focus.before.y, 0);
});

it("keeps RTL label position continuous with a prepend and a rapid reversal", async () => {
  await load("variant=rounded&rtl&prepend");
  const focus = await motion(true, false);
  expect(focus.start.x).toBeCloseTo(focus.before.x, 0);
  expect(focus.start.y).toBeCloseTo(focus.before.y, 0);
  const blur = await motion(false);
  expectContinuous(blur);
  expect(blur.end.x).toBeCloseTo(focus.before.x, 0);
  expect(blur.end.y).toBeCloseTo(focus.before.y, 0);
});

it.each([
  ["outlined", "", 16],
  ["rounded", "rtl&select", 32],
])("floats %s labels to the outer inset with a prepend (%s)", async (variant, query, inset) => {
  await load(`variant=${variant}&${query}&prepend`);
  const wrapper = (await page.locator(".q-field__wrapper").boundingBox())!;
  const focus = await motion(true);
  expectContinuous(focus);
  expect(focus.middle.x).toBeGreaterThan(Math.min(focus.before.x, focus.end.x));
  expect(focus.middle.x).toBeLessThan(Math.max(focus.before.x, focus.end.x));
  const edge = query.includes("rtl") ? wrapper.x + wrapper.width : wrapper.x;
  expect(Math.abs(focus.end.x - edge)).toBeCloseTo(inset, 0);
});

it("keeps enlarged, wrapped labels and input text inside a dense field", async () => {
  await load("variant=outlined&dense&long&size=32");
  await motion(true);
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

it("does not animate label movement when reduced motion is requested", async () => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await load("variant=outlined");
  const focus = await motion(true);
  expect(focus.start.y).toBeCloseTo(focus.end.y, 0);
  const blur = await motion(false);
  expect(blur.start.y).toBeCloseTo(blur.end.y, 0);
});

it.each(["outlined", "rounded"])(
  "keeps inactive %s labels clear of append content",
  async (variant) => {
    await load(`variant=${variant}&long&append`);
    const gap = await page.locator(".q-field__wrapper").evaluate((wrapper) => {
      const label = wrapper.querySelector(".q-field__label-text")!.getBoundingClientRect();
      const append = wrapper.querySelector(".q-field__snippet-append")!.getBoundingClientRect();

      return append.left - label.right;
    });
    expect(gap).toBeGreaterThanOrEqual(15);
    expectContinuous(await motion(true));
    expectContinuous(await motion(false));
  }
);

it.each(["variant=outlined", "variant=rounded&select&rtl", "variant=rounded&value"])(
  "keeps prepend spacing stable before and during hydration (%s)",
  async (query) => {
    await load(`${query}&prepend&ssr`);
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

    await page.evaluate(() => window.hydrateField());

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

it("centers the dropdown arrow beside a wrapped inactive label", async () => {
  await load("variant=outlined&select&long");
  const wrapper = (await page.locator(".q-field__wrapper").boundingBox())!;
  const arrow = (await page.locator(".q-select__arrow-toggle").boundingBox())!;
  expect(arrow.y + arrow.height / 2).toBeCloseTo(wrapper.y + wrapper.height / 2, 0);
});

it("focuses a narrow select when clicking an enlarged, wrapped label", async () => {
  await load("variant=outlined&select&long&size=32&width=200");
  const point = await page.locator(".q-field__label-text").evaluate((label) => {
    const rect = label.getBoundingClientRect();

    return {
      x: rect.x + rect.width / 2,
      y: rect.bottom - 1.5 * parseFloat(getComputedStyle(label).lineHeight),
    };
  });
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.locator(".q-field__wrapper").evaluate(async (wrapper) => {
    await Promise.allSettled(
      wrapper.getAnimations({ subtree: true }).map((animation) => animation.finished)
    );
  });
  await page.mouse.up();
  const input = page.locator(".q-field__input");
  expect(await input.getAttribute("aria-expanded")).toBe("true");
  expect(await input.evaluate((element) => document.activeElement === element)).toBe(true);
});
