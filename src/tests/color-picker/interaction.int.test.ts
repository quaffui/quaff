import { chromium, type Browser, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";

let server: ViteDevServer;
let browser: Browser;
let page: Page;

beforeAll(async () => {
  server = await createServer({
    mode: "test",
    cacheDir: ".svelte-kit/vite-color-picker-test",
    server: { host: "127.0.0.1", port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "color-picker-test-fixture",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use((request, response, next) => {
            if (request.url?.split("?")[0] !== "/color-picker-test") {
              return next();
            }

            void server
              .transformIndexHtml(
                "/color-picker-test",
                `<!doctype html><html><body>
                <script type="module">
                  import { mount } from "svelte";
                  import Fixture from "/src/tests/color-picker/InteractionFixture.svelte";
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

  // Compile the fixture within the setup timeout, before timed interactions begin.
  page = await browser.newPage();
  await load();
  await page.close();
}, 30_000);

beforeEach(async () => {
  page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
});

afterEach(async () => {
  await page?.close();
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function load(params: Record<string, string> = {}) {
  await page.goto(
    `${server.resolvedUrls!.local[0]}color-picker-test?${new URLSearchParams(params)}`
  );
  await page.locator("#color").waitFor();
}

async function savedValue() {
  return JSON.parse((await page.locator("#value").textContent())!);
}

async function commit(text: string) {
  await page.locator("#color").fill(text);
  await page.locator("#color").press("Enter");
}

async function expectColor(display: string, saved: string | null) {
  await expect.poll(() => page.locator("#color").inputValue()).toBe(display);
  await expect.poll(savedValue).toBe(saved);
  expect(await page.locator("#color").getAttribute("aria-invalid")).toBeNull();
  expect(
    await page.locator("#color").evaluate((el) => (el as HTMLInputElement).validity.valid)
  ).toBe(true);
}

it.each(["true", "false"])("keeps masked RGB commits editable with fillMask=%s", async (fill) => {
  await load({ fill });
  await commit("#6750A4");
  await expectColor("#6750A4", "rgb(103, 80, 164)");
  await commit("#112233");
  await expectColor("#112233", "rgb(17, 34, 51)");
});

it("formats initial and external RGB values as masked HEX", async () => {
  await load({ value: "rgb(103, 80, 164)" });
  await expectColor("#6750A4", "rgb(103, 80, 164)");
  await page.locator("#update").click();
  await expectColor("#112233", "rgb(17, 34, 51)");
});

it("formats popup Apply as HEX and preserves opacity during a later six-slot edit", async () => {
  await load({ value: "rgba(103, 80, 164, 0.25)", alpha: "true" });
  await page.getByRole("button", { name: "Choose color" }).click();
  const popup = page.getByRole("dialog");
  await popup.getByRole("button", { name: "HEX", exact: true }).click();
  await popup.getByRole("textbox", { name: "HEX", exact: true }).fill("#11223380");
  await popup.getByRole("button", { name: "Apply", exact: true }).click();
  await popup.waitFor({ state: "detached" });
  await expectColor("#112233", "rgba(17, 34, 51, 0.502)");
  await commit("#445566");
  await expectColor("#445566", "rgba(68, 85, 102, 0.502)");
});

it.each(["rgb", "hex"])("preserves alpha in six-slot edits with %s output", async (format) => {
  await load({ value: "rgba(103, 80, 164, 0.25)", alpha: "true", format });
  await commit("#112233");
  await expectColor("#112233", format === "rgb" ? "rgba(17, 34, 51, 0.25)" : "#11223340");
});

it("edits opacity using all eight HEX positions", async () => {
  await load({ mask: "8", alpha: "true", value: "rgba(17, 34, 51, 0.25)" });
  await expectColor("#11223340", "rgba(17, 34, 51, 0.25)");
  await commit("#44556680");
  await expectColor("#44556680", "rgba(68, 85, 102, 0.502)");
});

it.each([
  ["6", "#ABC___"],
  ["6", "#ABCD__"],
  ["6", "#A_CDEF"],
  ["8", "#ABC_____"],
  ["8", "#ABCDEF__"],
  ["8", "#ABCD_EF0"],
])("rejects incomplete %s-slot input %s without updating the model", async (mask, input) => {
  await load({ mask, alpha: "true", value: "rgba(17, 34, 51, 0.25)" });
  await commit(input);
  expect(await savedValue()).toBe("rgba(17, 34, 51, 0.25)");
  expect(await page.locator("#color").inputValue()).toBe(input);
  expect(await page.locator("#color").getAttribute("aria-invalid")).toBe("true");
  expect(
    await page.locator("#color").evaluate((el) => (el as HTMLInputElement).validity.valid)
  ).toBe(false);
});

it("clears filled masks to null", async () => {
  await load({ value: "rgb(17, 34, 51)" });
  await commit("");
  await expectColor("#______", null);
});

it("recovers from invalid input when the next commit equals the saved value", async () => {
  await load({ value: "rgb(17, 34, 51)" });
  await commit("#GGGGGG");
  expect(await page.locator("#color").getAttribute("aria-invalid")).toBe("true");
  await commit("#112233");
  await expectColor("#112233", "rgb(17, 34, 51)");
});

it("continues displaying and accepting RGB with no mask", async () => {
  await load({ mask: "none", value: "rgb(17, 34, 51)" });
  await expectColor("rgb(17, 34, 51)", "rgb(17, 34, 51)");
  await commit("rgb(68, 85, 102)");
  await expectColor("rgb(68, 85, 102)", "rgb(68, 85, 102)");
});
