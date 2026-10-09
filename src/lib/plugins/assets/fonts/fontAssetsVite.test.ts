import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build, createServer } from "vite";
import { describe, expect, it } from "vitest";
import { FontAssetStore } from "./fontAssetStore.js";
import type { InlineConfig, Plugin } from "vite";

const BYTES = new Uint8Array([1, 2, 3, 4]);
const BASE = "/nested/";

async function createFixture(cacheName: string) {
  const root = await mkdtemp(join(tmpdir(), "quaff-font-vite-"));
  const cacheDir = join(root, cacheName);
  const assets = new FontAssetStore({ root, cacheDir });
  const url = await assets.writeAsset("font.woff2", BYTES);
  const stylesheetId = join(root, ".quaff-fonts.css");
  await writeFile(join(root, "index.html"), '<script type="module" src="/main.js"></script>');
  await writeFile(join(root, "main.js"), 'import "virtual:fonts.css";');

  const plugin: Plugin = {
    name: "font-assets-fixture",
    resolveId(id) {
      if (["virtual:fonts.css", "/.quaff-fonts.css", stylesheetId].includes(id)) {
        return stylesheetId;
      }
    },
    load(id) {
      if (id === stylesheetId) {
        return `@font-face{font-family:Fixture;src:url("${url}") format("woff2");}`;
      }
    },
  };
  const config: InlineConfig = {
    root,
    cacheDir,
    base: BASE,
    configFile: false,
    plugins: [plugin],
    logLevel: "silent",
    build: { write: false, assetsInlineLimit: 0 },
    server: { host: "127.0.0.1", port: 0, fs: { allow: [root, assets.directory] } },
  };

  return { root, assets, config };
}

describe("font assets through Vite", () => {
  it.each(["cache space ü", "cache #", "cache ?", "cache %"])(
    "serves and builds fonts with a custom base and %s",
    async (cacheName) => {
      const fixture = await createFixture(cacheName);

      try {
        const result = await build(fixture.config);
        const outputs = Array.isArray(result) ? result : [result];
        const files = outputs.flatMap((output) => ("output" in output ? output.output : []));
        const font = files.find((file) => file.fileName.endsWith(".woff2"));
        const stylesheet = files.find((file) => file.fileName.endsWith(".css"));

        expect(font?.type).toBe("asset");
        expect(stylesheet?.type).toBe("asset");

        if (stylesheet?.type !== "asset" || !font) {
          throw new Error("Vite did not emit the font and stylesheet");
        }

        expect(String(stylesheet.source)).toContain(`${BASE}${font.fileName}`);
        expect(String(stylesheet.source)).not.toContain("/@fs/");

        const server = await createServer(fixture.config);

        try {
          await server.listen();
          const transformed = await server.transformRequest("/.quaff-fonts.css");
          const serializedCss = transformed?.code.match(/const __vite__css = (.+)\n/)?.[1];

          if (!serializedCss) {
            throw new Error("Vite did not return the development stylesheet");
          }

          const css = JSON.parse(serializedCss) as string;
          const fontUrl = css.match(/url\("([^"]+)"\)/)?.[1];
          const address = server.httpServer?.address();

          if (!fontUrl || !address || typeof address === "string") {
            throw new Error("Vite did not create a font URL and server address");
          }

          expect(fontUrl).toMatch(/^\/nested\//);
          const response = await fetch(`http://127.0.0.1:${address.port}${fontUrl}`);

          expect(response.status).toBe(200);
          expect(new Uint8Array(await response.arrayBuffer())).toEqual(BYTES);
        } finally {
          await server.close();
        }
      } finally {
        await rm(fixture.root, { recursive: true, force: true });
        await rm(fixture.assets.directory, { recursive: true, force: true });
      }
    }
  );
});
