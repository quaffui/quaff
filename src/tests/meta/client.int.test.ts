import { chromium, type Browser, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, beforeAll, expect, it } from "vitest";

let server: ViteDevServer;
let browser: Browser;
let page: Page;

beforeAll(async () => {
  server = await createServer({
    mode: "test",
    cacheDir: ".svelte-kit/vite-meta-test",
    server: { host: "127.0.0.1", port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "meta-test-fixture",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use(async (request, response, next) => {
            if (request.url !== "/meta-test") {
              return next();
            }

            try {
              const html = await server.transformIndexHtml(
                "/meta-test",
                `<!doctype html><html><head></head><body>
                <script type="module">
                  import { mount } from "svelte";
                  import Fixture from "/src/tests/meta/ClientFixture.svelte";
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
  page = await browser.newPage();
}, 30_000);

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function readHead() {
  return page.evaluate(() => ({
    title: document.title,
    descriptions: Array.from(document.head.querySelectorAll('meta[name="description"]'), (tag) =>
      tag.getAttribute("content")
    ),
    robots: Array.from(document.head.querySelectorAll('meta[name="robots"]'), (tag) =>
      tag.getAttribute("content")
    ),
  }));
}

it("keeps replacement page metadata and removes tags from destroyed pages", async () => {
  await page.goto(`${server.resolvedUrls!.local[0]}meta-test`);
  await expect.poll(readHead).toEqual({
    title: "First page",
    descriptions: ["First description"],
    robots: [],
  });
  await page.getByRole("button", { name: "Second page" }).click();
  await expect.poll(readHead).toEqual({
    title: "Second page",
    descriptions: ["Second description"],
    robots: [],
  });
  await page.getByRole("button", { name: "Private page" }).click();
  await expect.poll(readHead).toEqual({
    title: "Private page",
    descriptions: [],
    robots: ["noindex"],
  });
  await page.getByRole("button", { name: "Remove page" }).click();
  await expect.poll(readHead).toEqual({ title: "Site", descriptions: [], robots: [] });
});
