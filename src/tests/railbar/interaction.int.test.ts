import { chromium, type Browser, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";

let server: ViteDevServer;
let browser: Browser;
let page: Page;

beforeAll(async () => {
  server = await createServer({
    mode: "test",
    server: { host: "127.0.0.1", port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "railbar-test-fixture",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use((request, response, next) => {
            if (request.url !== "/railbar-test") {
              return next();
            }

            void server
              .transformIndexHtml(
                "/railbar-test",
                `<!doctype html><html><body>
            <script type="module">
              import { mount } from "svelte";
              import Fixture from "/src/tests/railbar/InteractionFixture.svelte";
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
}, 30_000);

beforeEach(async () => {
  page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.goto(`${server.resolvedUrls!.local[0]}railbar-test`);
  await page.locator("#rail").waitFor();
});

afterEach(async () => {
  await page?.close();
});
afterAll(async () => {
  await browser?.close();
  await server?.close();
});

async function events() {
  return JSON.parse((await page.locator("#events").textContent())!);
}

async function settle() {
  await page.locator("#rail").evaluate(async (element) => {
    await Promise.allSettled(element.getAnimations().map((animation) => animation.finished));
  });
}

async function expand() {
  await page.locator("#expand").click();
  await expect.poll(() => page.locator("#rail").evaluate((el) => el.matches(":modal"))).toBe(true);
  await settle();
  expect(await events()).toEqual([]);
}

it.each(["Escape", "scrim", "collapse", "external"])(
  "forwards one native close after %s while keeping the collapsed rail visible",
  async (action) => {
    await expand();

    if (action === "Escape") {
      await page.keyboard.press("Escape");
    } else if (action === "scrim") {
      await page.mouse.click(700, 300);
    } else if (action === "external") {
      await page.locator("#rail").evaluate((el) => (el as HTMLDialogElement).close());
    } else {
      await page.locator("#collapse").click();
    }

    await expect.poll(events).toEqual([{ target: true, currentTarget: "rail", expanded: false }]);
    expect(await page.locator("#expanded").textContent()).toBe("false");
    expect(
      await page.locator("#rail").evaluate((el) => [el.hasAttribute("open"), el.matches(":modal")])
    ).toEqual([true, false]);
    expect(await page.locator("#expand").evaluate((el) => document.activeElement === el)).toBe(
      true
    );
  }
);

it("forwards a queued close without collapsing a modal reopened before delivery", async () => {
  await expand();
  await page.locator("#rail").evaluate((el) => {
    const dialog = el as HTMLDialogElement;
    dialog.close();
    dialog.showModal();
  });
  await expect.poll(events).toEqual([{ target: true, currentTarget: "rail", expanded: true }]);
  expect(await page.locator("#expanded").textContent()).toBe("true");
  expect(await page.locator("#rail").evaluate((el) => el.matches(":modal"))).toBe(true);
});

it("restores navigation attributes and preserves expansion when modal mode ends", async () => {
  await expand();
  const navigation = page.locator("#rail nav");
  const attributes = () =>
    navigation.evaluate((el) =>
      ["aria-describedby", "aria-live", "tabindex"].map((name) => el.getAttribute(name))
    );
  expect(await attributes()).toEqual([null, null, null]);
  await page.locator("#standard").click();
  await expect.poll(events).toEqual([{ target: true, currentTarget: "rail", expanded: true }]);
  await expect.poll(attributes).toEqual(["description", "polite", "0"]);
  expect(await page.locator("#expanded").textContent()).toBe("true");
});

it("keeps prevented and interrupted dismissals open without close notifications", async () => {
  await expand();
  await page.locator("#prevent").click();
  await page.keyboard.press("Escape");
  expect(await page.locator("#expanded").textContent()).toBe("true");
  await page.locator("#collapse").click();
  expect(
    await page
      .locator("#rail")
      .evaluate((el) =>
        el
          .getAnimations()
          .some(
            (animation) =>
              animation instanceof CSSTransition && animation.transitionProperty === "width"
          )
      )
  ).toBe(true);
  await page.locator("#expand").dispatchEvent("click");
  await settle();
  expect(await events()).toEqual([]);
  expect(await page.locator("#rail").evaluate((el) => el.matches(":modal"))).toBe(true);
});

it("releases modality on teardown without notifying a destroyed rail", async () => {
  await expand();
  await page.locator("#remove").click();
  await page.locator("#rail").waitFor({ state: "detached" });
  await page.locator("#expand").click();
  expect(await events()).toEqual([]);
  expect(await page.locator(":modal").count()).toBe(0);
});
