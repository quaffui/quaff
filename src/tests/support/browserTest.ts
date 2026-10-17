import { chromium, type BrowserContextOptions, type Page } from "playwright";
import { test } from "vitest";
import { startAppServer } from "./appFixture";
import { startComponentServer, type ComponentServerOptions } from "./componentServer";
import type { FixtureQuery, FixtureServer } from "./fixtureServer";

interface FixtureTestOptions {
  /** Marks a fixture page as ready after navigation. */
  readySelector: string;
  pageOptions?: BrowserContextOptions;
  /** Prepares each opened fixture page, for example by settling its entrance animations. */
  onOpen?: (page: Page) => Promise<void>;
}

interface OpenFixtureOptions {
  /** Opens another page of the fixture server. */
  path?: string;
  readySelector?: string;
}

interface ComponentTestOptions extends ComponentServerOptions, FixtureTestOptions {}

interface AppTestOptions extends FixtureTestOptions {
  /** App directory below `tests/fixtures`. */
  app: string;
}

// Set QUAFF_BROWSER_CHANNEL=chrome to test with an installed Chrome instead of Playwright's build.
const browserChannel = process.env.QUAFF_BROWSER_CHANNEL || undefined;

/**
 * Provides one browser per test file, a fresh `page` per test and the `pageErrors` and
 * `requestedUrls` collected from that page.
 */
export function createBrowserTest(pageOptions: BrowserContextOptions = {}) {
  return test
    .extend("browser", { scope: "file" }, async ({}, { onCleanup }) => {
      const browser = await chromium.launch({ channel: browserChannel });
      onCleanup(() => browser.close());

      return browser;
    })
    .extend("page", async ({ browser }, { onCleanup }) => {
      const page = await browser.newPage(pageOptions);
      onCleanup(() => page.close());

      return page;
    })
    .extend("pageErrors", { auto: true }, ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      return pageErrors;
    })
    .extend("requestedUrls", { auto: true }, ({ page }) => {
      const requestedUrls: string[] = [];
      page.on("request", (request) => requestedUrls.push(request.url()));

      return requestedUrls;
    });
}

/** Tests a fixture component from `src/tests` served by Vite. */
export function createComponentTest({
  component,
  stylesheets,
  hasIconFont,
  ...options
}: ComponentTestOptions) {
  return createFixtureTest(
    () => startComponentServer({ component, stylesheets, hasIconFont }),
    options
  );
}

/** Tests a built SvelteKit app from `tests/fixtures`. */
export function createAppTest({ app, ...options }: AppTestOptions) {
  return createFixtureTest(() => startAppServer(app), options);
}

/**
 * Adds a file-scoped fixture `server` and `openFixture(query, options)` to the browser test.
 * Do not `.extend()` the result: Vitest keeps file-scoped fixtures per test API, so
 * extended tests would start a second browser and server besides the warmed-up ones.
 */
function createFixtureTest(
  startServer: () => Promise<FixtureServer>,
  { readySelector, pageOptions, onOpen }: FixtureTestOptions
) {
  const fixtureTest = createBrowserTest(pageOptions)
    .extend("server", { scope: "file" }, async ({}, { onCleanup }) => {
      const server = await startServer();
      onCleanup(() => server.close());

      return server;
    })
    .extend("openFixture", ({ page, server }) => {
      return async (query?: FixtureQuery, options: OpenFixtureOptions = {}) => {
        await page.goto(server.getUrl(query, options.path));
        await page.locator(options.readySelector ?? readySelector).waitFor();
        await page.evaluate(() => document.fonts.ready);
        await onOpen?.(page);
      };
    });

  // Start and compile the fixture within the hook timeout, before timed interactions begin.
  fixtureTest.beforeAll(async ({ browser, server }) => {
    const page = await browser.newPage();
    await page.goto(server.getUrl());
    await page.locator(readySelector).waitFor();
    await page.close();
  });

  return fixtureTest;
}
