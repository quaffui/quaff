import { chromium, type Browser, type Page, type Route } from "playwright";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import { getCssAsset } from "../assets/cssFixture";

const HIGHLIGHTING_ENGINE_URL_PATTERN = /\/wasm[-./]/;

let server: ViteDevServer;
let browser: Browser;
let page: Page;
let highlightingEngineRequests: string[];
let pageErrors: string[];

beforeAll(async () => {
  const fixtureCss = getCssAsset("index");
  server = await createServer({
    mode: "test",
    cacheDir: ".svelte-kit/vite-highlighting-test",
    server: { host: "127.0.0.1", port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "highlighting-test-fixture",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use(async (request, response, next) => {
            if (request.url !== "/highlighting-test") {
              return next();
            }

            try {
              const html = await server.transformIndexHtml(
                "/highlighting-test",
                `<!doctype html><html><head><link rel="icon" href="data:,">
                <style>${fixtureCss}</style></head><body><script type="module">
                  import { mount } from "svelte";
                  import Fixture from "/src/tests/code-block/HighlightingFixture.svelte";
                  mount(Fixture, { target: document.body });
                </script></body></html>`
              );
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
}, 30_000);

beforeEach(async () => {
  highlightingEngineRequests = [];
  pageErrors = [];
  page = await browser.newPage({ permissions: ["clipboard-read", "clipboard-write"] });
  page.on("request", (request) => {
    const requestUrl = request.url();
    const isHighlightingEngineRequest = HIGHLIGHTING_ENGINE_URL_PATTERN.test(requestUrl);

    if (isHighlightingEngineRequest) {
      highlightingEngineRequests.push(requestUrl);
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`${server.resolvedUrls!.local[0]}highlighting-test`);
  await page.waitForLoadState("networkidle");
  expect(await page.locator(".q-code-block").count()).toBe(0);
  expect(highlightingEngineRequests).toEqual([]);
}, 30_000);

afterEach(async () => {
  expect(pageErrors).toEqual([]);
  await page?.close();
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

it("highlights example source only when opened and supports reopening", async () => {
  const sourceTrigger = page.locator("#example .q-docs-section__actions button");
  const dialog = page.getByRole("dialog");
  await sourceTrigger.click();
  await dialog.locator(".shiki").waitFor();
  expect(await dialog.locator("code").textContent()).toBe('<QBtn label="Example" />');
  expect(highlightingEngineRequests.length).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  await page.getByRole("button", { name: "Copied!", exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  const isSourceTriggerFocused = await sourceTrigger.evaluate(
    (element) => element === document.activeElement
  );
  expect(isSourceTriggerFocused).toBe(true);
  await sourceTrigger.click();
  await dialog.locator(".shiki").waitFor();
}, 15_000);

it("preserves type tooltip focus during highlighting and cleans up on tab changes", async () => {
  let highlightingEngineRoute: Route | undefined;
  await page.route(HIGHLIGHTING_ENGINE_URL_PATTERN, (route) => {
    highlightingEngineRoute = route;
  });

  const typeTrigger = page.locator('[data-type-name="Size"]');
  await typeTrigger.focus();
  const tooltip = page.getByRole("tooltip");
  const code = tooltip.locator("code");
  await code.waitFor();
  await page.keyboard.press("Tab");
  const focusedCode = await code.elementHandle();
  const isFallbackCodeFocused = await focusedCode!.evaluate(
    (element) => element === document.activeElement
  );
  expect(isFallbackCodeFocused).toBe(true);
  await expect.poll(() => highlightingEngineRoute).toBeDefined();
  await highlightingEngineRoute!.continue();
  await tooltip.locator(".shiki").waitFor();
  const hasPreservedFocus = await focusedCode!.evaluate(
    (element) => element === document.activeElement
  );
  expect(hasPreservedFocus).toBe(true);
  expect(await code.evaluate((element) => getComputedStyle(element).padding)).toBe("0px");
  expect(await tooltip.locator("code").textContent()).toBe('type Size = "small" | "large";');
  expect(highlightingEngineRequests.length).toBeGreaterThan(0);
  const initialThemeClass = await tooltip.locator("pre").getAttribute("class");

  // Keep keyboard focus in the code while changing the theme.
  await page
    .getByRole("button", { name: "Toggle theme" })
    .evaluate((button) => (button as HTMLButtonElement).click());
  await expect.poll(() => tooltip.locator("pre").getAttribute("class")).not.toBe(initialThemeClass);
  const hasPreservedThemeFocus = await focusedCode!.evaluate(
    (element) => element === document.activeElement
  );
  expect(hasPreservedThemeFocus).toBe(true);
  await page.getByRole("tab", { name: "Methods" }).click();
  await tooltip.waitFor({ state: "detached" });
  expect(await page.locator(".q-code-block").count()).toBe(0);
  await page.getByRole("tab", { name: "Props" }).click();
  await typeTrigger.hover();
  await tooltip.locator(".shiki").waitFor();
  expect(await page.getByRole("tooltip").count()).toBe(1);
  await code.focus();
  await page.keyboard.press("Escape");
  await tooltip.waitFor({ state: "detached" });
  const isTypeTriggerFocused = await typeTrigger.evaluate(
    (element) => element === document.activeElement
  );
  expect(isTypeTriggerFocused).toBe(true);
});
