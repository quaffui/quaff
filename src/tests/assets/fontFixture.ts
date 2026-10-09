import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { build, createServer } from "vite";
import { quaffAssets } from "../../lib/plugins/assets.js";
import { getCssAsset } from "./cssFixture.js";
import type { QuaffAssetsOptions } from "../../lib/plugins/assets.js";
import type { InlineConfig, Plugin, Rollup, ViteDevServer } from "vite";

const MODULES_ROOT = fileURLToPath(new URL("../../../node_modules/", import.meta.url));
const directories = new Set<string>();
const servers = new Set<ViteDevServer>();

export async function createFontFixture(
  files: Record<string, string>,
  options: QuaffAssetsOptions,
  base = "/"
) {
  const root = await mkdtemp(join(tmpdir(), "quaff-font-integration-"));
  directories.add(root);
  await symlink(MODULES_ROOT, join(root, "node_modules"), "dir");
  await writeFile(join(root, "package.json"), '{"type":"module"}');
  await writeFile(
    join(root, "index.html"),
    '<!doctype html><html><body><script type="module" src="/src/main.ts"></script></body></html>'
  );

  async function write(name: string, source: string) {
    const file = join(root, "src", name);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, source);

    return file;
  }

  await write("main.ts", 'import "./routes/+layout.svelte";');

  for (const [name, source] of Object.entries(files)) {
    await write(name, source);
  }

  const plugin = quaffAssets(options);
  const config: InlineConfig = {
    root,
    base,
    configFile: false,
    envFile: false,
    logLevel: "silent",
    cacheDir: join(root, ".vite"),
    plugins: [plugin, svelte({ configFile: false }), createBuiltCssFixturePlugin()],
    build: { write: false, assetsInlineLimit: 0, minify: false },
    server: {
      middlewareMode: true,
      fs: { allow: [root, MODULES_ROOT] },
      watch: { ignored: ["**/*"] },
    },
    optimizeDeps: { noDiscovery: true, include: [] },
  };

  return {
    root,
    plugin,
    write,
    async build() {
      const result = await build(config);

      if (Array.isArray(result)) {
        return collectBuildAssets(result.flatMap((output) => output.output));
      }

      if (!("output" in result)) {
        throw new Error("Expected a completed Vite build, received a build watcher.");
      }

      return collectBuildAssets(result.output);
    },
    async start() {
      const server = await createServer(config);
      servers.add(server);
      await server.environments.client.pluginContainer.buildStart({});
      await server.transformRequest("/@quaff/virtual.css");

      return server;
    },
  };
}

function collectBuildAssets(output: readonly (Rollup.OutputAsset | Rollup.OutputChunk)[]) {
  const css: string[] = [];
  const fontAssets: Rollup.OutputAsset[] = [];

  for (const entry of output) {
    if (entry.type !== "asset") {
      continue;
    }

    if (entry.fileName.endsWith(".css")) {
      css.push(String(entry.source));
    } else if (/\.woff2?$/.test(entry.fileName)) {
      fontAssets.push(entry);
    }
  }

  return { css: css.join("\n"), fontAssets };
}

export async function cleanupFontFixtures() {
  await Promise.all([...servers].map((server) => server.close()));
  servers.clear();
  await Promise.all([...directories].map((root) => rm(root, { recursive: true, force: true })));
  directories.clear();
}

export async function readDevelopmentCss(server: ViteDevServer) {
  const transformed = await server.transformRequest("/@quaff/virtual.css?inline");
  const match = transformed?.code.match(/export default ("(?:\\[\s\S]|[^"\\])*")/);

  if (!match) {
    throw new Error("Expected Vite's inline CSS export.");
  }

  return JSON.parse(match[1]) as string;
}

export async function updateDevelopmentSource(
  plugin: Plugin,
  server: ViteDevServer,
  file: string,
  source: string
) {
  const hook = plugin.hotUpdate;
  const handler = typeof hook === "function" ? hook : hook?.handler;

  if (!handler) {
    throw new Error("The CSS plugin must handle environment-aware hot updates.");
  }

  const context = { environment: server.environments.client } as ThisParameterType<typeof handler>;

  return handler.call(context, {
    type: "update",
    file,
    timestamp: Date.now(),
    read: async () => source,
    modules: [],
    server,
  });
}

function createBuiltCssFixturePlugin(): Plugin {
  const id = "\0quaff-fixture-full.css";

  return {
    name: "quaff-fixture:built-css",
    resolveId(source) {
      return source === "@quaffui/quaff/css/index.css" ? id : undefined;
    },
    load(source) {
      return source === id ? getCssAsset("index") : undefined;
    },
  };
}
