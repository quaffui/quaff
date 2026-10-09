import { transform } from "esbuild";
import { render } from "svelte/server";
import { createServer } from "vite";
import { getCssAsset } from "../assets/cssFixture";
import VisibilityFixture from "./VisibilityFixture.svelte";

const FIXTURE_PATH = "/side-sheet-test";

// Use the field tests' SSR/manual-hydration setup to inspect the initial layout.
export async function startFixture() {
  const css = ["base", "components/side-sheet", "components/button", "components/icon"]
    .map(getCssAsset)
    .join("\n");
  const minified = await transform(css, { loader: "css", minify: true });
  const server = await createServer({
    mode: "test",
    cacheDir: ".svelte-kit/vite-side-sheet-test",
    server: { host: "127.0.0.1", port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "side-sheet-test-fixture",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use(async (request, response, next) => {
            const url = new URL(request.url!, "http://localhost");

            if (url.pathname !== FIXTURE_PATH) {
              return next();
            }

            try {
              const query = url.search;
              const ssr = url.searchParams.has("ssr");
              const body = ssr ? render(VisibilityFixture, { props: { query } }).body : "";
              const html = await server.transformIndexHtml(
                FIXTURE_PATH,
                `<!doctype html><html><head>
                  <link rel="icon" href="data:,">
                  <style>${minified.code}</style>
                </head><body>${body}<script type="module">
                  import { hydrate, mount, tick } from "svelte";
                  import Fixture from "/src/tests/side-sheet/VisibilityFixture.svelte";
                  const props = { query: window.location.search };
                  window.hydrateSheet = async () => {
                    hydrate(Fixture, { target: document.body, props });
                    await tick();
                  };
                  if (!new URLSearchParams(props.query).has("ssr")) {
                    mount(Fixture, { target: document.body, props });
                  }
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

  return {
    url: new URL(FIXTURE_PATH, server.resolvedUrls!.local[0]).href,
    close: () => server.close(),
  };
}
