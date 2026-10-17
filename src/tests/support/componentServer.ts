import { transform } from "esbuild";
import { createServer, type Connect, type ViteDevServer } from "vite";
import { getCssAsset } from "../assets/cssFixture";
import { createFixtureUrl, type FixtureServer } from "./fixtureServer";
import type { Component } from "svelte";
import type * as SvelteServer from "svelte/server";

declare global {
  interface Window {
    /** The fixture component module, including exports from its `<script module>`. */
    fixture: Record<string, unknown>;
    hydrateFixture: () => Promise<void>;
  }
}

export interface ComponentServerOptions {
  /** Fixture component below `src/tests`, such as `slider/InteractionFixture.svelte`. */
  component: string;
  /** Built Quaff stylesheets, such as `base` or `components/slider`. */
  stylesheets?: string[];
  /** Loads the Material Symbols font so icons get their real glyph geometry. */
  hasIconFont?: boolean;
}

const FIXTURE_ROUTE = "/fixture/";
const ICON_FONT_CSS = `@font-face {
  font-family: "Material Symbols Outlined";
  src: url("/node_modules/material-symbols/material-symbols-outlined.woff2");
}`;

/**
 * Serves fixture components with Vite, compiled like the real components. Each fixture
 * receives the page query as its `query` prop. Pages opened with `ssr` in the query are
 * server-rendered and wait for `window.hydrateFixture()`.
 */
export async function startComponentServer({
  component,
  stylesheets = [],
  hasIconFont = false,
}: ComponentServerOptions): Promise<FixtureServer> {
  const css = await createFixtureCss(stylesheets, hasIconFont);
  const server = await createServer({
    mode: "test",
    // Separate optimizer caches let test files start their servers in parallel.
    cacheDir: `.svelte-kit/vite-test/${component.replace(/\W+/g, "-")}`,
    server: { host: "127.0.0.1", port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "quaff-component-fixture",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use(createFixtureMiddleware(server, css));
        },
      },
    ],
  });
  await server.listen();
  const baseUrl = server.resolvedUrls!.local[0];

  return {
    getUrl: (query, path = component) => createFixtureUrl(baseUrl, FIXTURE_ROUTE + path, query),
    close: () => server.close(),
  };
}

/** Combines built Quaff stylesheets, minified like the published package CSS. */
export async function createFixtureCss(stylesheets: string[], hasIconFont = false) {
  const css = stylesheets.map(getCssAsset);

  if (hasIconFont) {
    css.push(ICON_FONT_CSS);
  }

  const minified = await transform(css.join("\n"), { loader: "css", minify: true });

  return minified.code;
}

function createFixtureMiddleware(server: ViteDevServer, css: string): Connect.NextHandleFunction {
  return async (request, response, next) => {
    const url = new URL(request.url!, "http://localhost");

    if (!url.pathname.startsWith(FIXTURE_ROUTE)) {
      return next();
    }

    try {
      const componentPath = `/src/tests/${url.pathname.slice(FIXTURE_ROUTE.length)}`;
      const isServerRendered = url.searchParams.has("ssr");
      const body = isServerRendered ? await renderFixture(server, componentPath, url.search) : "";
      const document = createFixtureDocument(componentPath, css, body);
      // Vite names inline script modules after this URL; keep them apart from the component.
      const html = await server.transformIndexHtml(`${url.pathname}.html`, document);
      response.setHeader("Content-Type", "text/html");
      response.end(html);
    } catch (error) {
      next(error);
    }
  };
}

// Load the renderer through Vite too, so it shares Svelte's runtime with the fixture.
async function renderFixture(server: ViteDevServer, componentPath: string, query: string) {
  const fixtureModule = await server.ssrLoadModule(componentPath);
  const { render } = (await server.ssrLoadModule("svelte/server")) as typeof SvelteServer;
  const fixture: Component<{ query: string }> = fixtureModule.default;

  return render(fixture, { props: { query } }).body;
}

function createFixtureDocument(componentPath: string, css: string, body: string) {
  return `<!doctype html><html><head>
    <link rel="icon" href="data:,">
    <style>${css}</style>
  </head><body>${body}<script type="module">
    import { hydrate, mount, tick } from "svelte";
    import * as fixture from "${componentPath}";
    const options = { target: document.body, props: { query: location.search } };
    window.fixture = fixture;
    window.hydrateFixture = async () => {
      hydrate(fixture.default, options);
      await tick();
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    };

    if (!new URLSearchParams(location.search).has("ssr")) {
      mount(fixture.default, options);
    }
  </script></body></html>`;
}
