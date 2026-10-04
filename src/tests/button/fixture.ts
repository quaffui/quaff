import { transform } from "esbuild";
import { createServer } from "vite";
import { cssAsset } from "../css/fixture";

const FIXTURE_PATH = "/button-radius-test";

// Keep serving the fixture separate from the tests, using the same Vite setup as field tests.
export async function startFixture() {
  const css = [
    "base",
    "components/button",
    "components/button-group",
    "components/icon",
    "components/toolbar",
  ]
    .map(cssAsset)
    .join("\n");
  const minified = await transform(css, { loader: "css", minify: true });
  const document = `<!doctype html><html><head>
    <link rel="icon" href="data:,">
    <style>${minified.code}</style>
    </head><body><script type="module">
      import { mount } from "svelte";
      import Fixture from "/src/tests/button/RadiusFixture.svelte";
      mount(Fixture, { target: document.body });
    </script></body></html>`;

  const server = await createServer({
    mode: "test",
    cacheDir: ".svelte-kit/vite-button-radius-test",
    server: { host: "127.0.0.1", port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "button-radius-test-fixture",
        enforce: "pre",
        configureServer(server) {
          server.middlewares.use(async (request, response, next) => {
            if (request.url !== FIXTURE_PATH) {
              return next();
            }

            try {
              // Vite resolves the module imports and compiles the real Svelte components.
              const html = await server.transformIndexHtml(FIXTURE_PATH, document);
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
