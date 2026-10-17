import { chromium, type Browser, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";

let server: ViteDevServer;
let browser: Browser;
let page: Page;

beforeAll(async () => {
  server = await createServer({
    mode: "test",
    cacheDir: ".svelte-kit/vite-dialog-test",
    server: { host: "127.0.0.1", port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "dialog-test-fixture",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use((request, response, next) => {
            if (request.url?.split("?")[0] !== "/dialog-test") {
              return next();
            }

            // SvelteKit's router listens on <html>, above the app's root element.
            void server
              .transformIndexHtml(
                "/dialog-test",
                `<!doctype html><html><body><div id="app"></div>
                <script type="module">
                  import { mount } from "svelte";
                  import Fixture from "/src/tests/dialog/ClickFixture.svelte";
                  window.rootClicks = [];
                  document.documentElement.addEventListener("click", (event) => {
                    window.rootClicks.push(event.target.id);
                  });
                  mount(Fixture, { target: document.getElementById("app") });
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
  page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
});

afterEach(async () => {
  await page?.close();
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function load(query = "", readySelector = "#dialog-action") {
  await page.goto(`${server.resolvedUrls!.local[0]}dialog-test?${query}`);
  await page.locator(readySelector).waitFor();
  // Dialogs and drawers start listening for outside clicks 150ms after opening.
  await page.waitForTimeout(200);
}

function readState(name: "dialog" | "other-dialog" | "drawer" | "menu" | "menu-dialog") {
  return page.locator("#state").getAttribute(`data-${name}`);
}

function readRootClicks() {
  return page.evaluate(() => (window as Window & { rootClicks?: string[] }).rootClicks);
}

it("lets clicks inside a dialog reach page-level listeners", async () => {
  await load();
  await page.locator("#dialog-action").click();
  await page.locator("#dialog-link").click();

  expect(await readRootClicks()).toEqual(["dialog-action", "dialog-link"]);
  expect(await readState("dialog")).toBe("true");
});

it("closes when clicking outside the dialog", async () => {
  await load();
  await page.locator("#outside").click();

  await expect.poll(() => readState("dialog")).toBe("false");
});

it("does not treat clicks in another dialog as outside clicks", async () => {
  await load("other");
  await page.locator("#other-dialog-action").click();

  expect(await readState("dialog")).toBe("true");
  expect(await readState("other-dialog")).toBe("true");
});

it("keeps an open drawer open when clicking inside a dialog", async () => {
  await load("drawer");
  await page.locator("#dialog-action").click();

  expect(await readState("drawer")).toBe("true");

  await page.locator("#outside").click();

  await expect.poll(() => readState("drawer")).toBe("false");
});

it("keeps an auto-closing menu open when clicking inside a dialog it contains", async () => {
  await load("menu", "#open-menu-dialog");
  await page.locator("#open-menu-dialog").click();
  await page.locator("#menu-dialog-action").waitFor();
  await page.waitForTimeout(200);
  await page.locator("#menu-dialog-action").click();

  expect(await readState("menu")).toBe("true");
  expect(await readState("menu-dialog")).toBe("true");
});
