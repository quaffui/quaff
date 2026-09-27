import { chromium, type Browser, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";

let server: ViteDevServer;
let browser: Browser;
let page: Page;

beforeAll(async () => {
  server = await createServer({
    mode: "test",
    cacheDir: ".svelte-kit/vite-drawer-test",
    server: { host: "127.0.0.1", port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "drawer-test-fixture",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use((request, response, next) => {
            if (request.url?.split("?")[0] !== "/drawer-test") {
              return next();
            }

            void server
              .transformIndexHtml(
                "/drawer-test",
                `<!doctype html><html><body>
                <script type="module">
                  import { mount } from "svelte";
                  import Fixture from "/src/tests/drawer/FocusFixture.svelte";
                  mount(Fixture, { target: document.body });
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
  page = await browser.newPage({ viewport: { width: 900, height: 600 } });
});

afterEach(async () => {
  await page?.close();
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function load(query = "") {
  await page.goto(`${server.resolvedUrls!.local[0]}drawer-test?${query}`);
  await page.locator("#open-drawer").waitFor();
}

async function focused() {
  return page.evaluate(() => document.activeElement?.id);
}

async function openDrawer(query = "") {
  await load(query);
  await page.locator("#open-drawer").click();
  await expect.poll(focused).toBe("open-dialog");
}

it.each([false, true])(
  "contains focus and restores the opener, with a standard rail present: %s",
  async (rail) => {
    await openDrawer(rail ? "rail" : "");
    expect(await page.locator("#drawer").getAttribute("aria-modal")).toBe("true");
    await page.keyboard.press("Shift+Tab");
    await expect.poll(focused).toBe("close-drawer");
    await page.keyboard.press("Tab");
    await expect.poll(focused).toBe("open-dialog");
    await page.locator("#outside").focus();
    await expect.poll(focused).toBe("open-dialog");
    await page.keyboard.press("Escape");
    await expect.poll(focused).toBe("open-drawer");
    expect(await page.locator("#drawer").getAttribute("aria-modal")).toBeNull();
  }
);

it.each(["", "modal"])("defers focus and Escape to a dialog with modal=%s", async (query) => {
  await openDrawer(query);
  await page.locator("#open-dialog").click();
  await page.locator("#dialog-action").waitFor();
  await page.locator("#dialog-action").focus();
  await expect.poll(focused).toBe("dialog-action");
  await page.keyboard.press("Escape");
  await expect.poll(() => page.locator("#dialog").getAttribute("open")).toBeNull();
  expect(await page.locator("#drawer").getAttribute("aria-modal")).toBe("true");
  await expect.poll(focused).toBe("open-dialog");
  await page.keyboard.press("Escape");
  await expect.poll(focused).toBe("open-drawer");
});

it("recovers focus after a control is blurred to the body", async () => {
  await openDrawer();
  await page.locator("#open-dialog").evaluate((element) => (element as HTMLElement).blur());
  await expect.poll(focused).toBe("open-dialog");
});

it("allows portalled menu focus and recovers it when Escape removes the menu", async () => {
  await openDrawer();
  await page.locator("#open-menu").click();
  const action = page.locator("#menu-action");
  await action.focus();
  await expect.poll(focused).toBe("menu-action");
  expect(await action.evaluate((element) => !!element.closest("#drawer"))).toBe(false);
  await page.keyboard.press("Escape");
  await action.waitFor({ state: "detached" });
  await expect.poll(focused).toBe("open-dialog");
  expect(await page.locator("#drawer").getAttribute("aria-modal")).toBe("true");
});
