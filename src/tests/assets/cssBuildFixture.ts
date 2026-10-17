import { mkdir, symlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { build, createServer } from "vite";
import { onTestFinished } from "vitest";
import { preprocessClasses } from "../../../plugins/dist/index.js";
import { createAssetsPlugin } from "../../lib/plugins/assets/assetPlugin.js";
import { createTemporaryDirectory } from "../support/temporaryDirectory.js";
import { readCssAsset } from "./cssFixture.js";
import type { QuaffAssetsCssOptions } from "../../lib/plugins/assets/assetOptions.js";
import type { InlineConfig, Manifest, Rollup } from "vite";

const MODULES_ROOT = fileURLToPath(new URL("../../../node_modules/", import.meta.url));
const LIB_ROOT = fileURLToPath(new URL("../../lib/", import.meta.url));
const BUTTONS_SOURCE =
  '<section class="q-card"><button class="q-btn">Save</button><span class="q-badge">Ready</span></section>';
const FIELDS_SOURCE =
  '<button class="q-btn">Apply</button><label class="q-checkbox">Enabled</label>';
export const CHIP_SOURCE =
  '<div class="q-chip q-chip--md"><div class="q-avatar q-avatar--md q-chip__avatar"><svg></svg></div></div>';

export async function buildCssFixture({
  cssCodeSplit,
  isCssOnly = false,
  isSourceSymlink = false,
  hasChipExample = true,
  hasServerReport = false,
  dev,
}: {
  cssCodeSplit?: boolean;
  isCssOnly?: boolean;
  isSourceSymlink?: boolean;
  hasChipExample?: boolean;
  hasServerReport?: boolean;
  dev?: QuaffAssetsCssOptions["dev"];
} = {}) {
  const root = await createTemporaryDirectory("css-build");
  await symlink(MODULES_ROOT, join(root, "node_modules"), "dir");

  if (isSourceSymlink) {
    const sourceRoot = join(root, "source");
    await mkdir(sourceRoot);
    await symlink(sourceRoot, join(root, "src"), "dir");
  }

  // These pages exercise application class usage, not component rendering. The
  // stylesheet reader compiles Quaff's real styles without requiring dist first.
  let buttonsSource = BUTTONS_SOURCE;
  let fieldsSource = FIELDS_SOURCE;

  if (hasChipExample) {
    buttonsSource += CHIP_SOURCE;
    fieldsSource += '<div class="q-avatar"></div>';
  }

  const files: Record<string, string> = {
    "package.json": '{"type":"module"}',
    "index.html": '<!doctype html><script type="module" src="/src/main.ts"></script>',
    "src/main.ts": `import { mount } from "svelte";
      import Layout from "./routes/+layout.svelte";
      mount(Layout, { target: document.body });
      window.openButtons = async () => {
        const { default: Buttons } = await import("./routes/buttons/+page.svelte");
        mount(Buttons, { target: document.body });
      };
      window.openFields = () => import("./routes/fields/+page.svelte");
      window.openSlider = () => import("./slider.ts");`,
    "src/routes/+layout.svelte":
      '<script>import preset from "../preset.json";</script><main class="q-pa-md"><div class={preset.className}>Application</div><button onclick={() => window.openButtons()}>Open buttons</button></main>',
    "src/preset.json": '{"className":"q-badge"}',
    "src/classNames.ts": 'export const RADIO_CLASS = "q-radio";',
    "src/routes/+page.server.ts":
      'import { RADIO_CLASS } from "../classNames"; export const load = () => ({ radioClass: RADIO_CLASS });',
    "src/slider.ts": 'export const SLIDER_CLASS = "q-slider";',
    "src/routes/buttons/+page.svelte": buttonsSource,
    "src/routes/fields/+page.svelte": fieldsSource,
  };

  if (hasServerReport) {
    // Reach real server-rendered components through an alias, barrel, and dynamic import.
    files["src/routes/+page.server.ts"] = 'export { load } from "$reports";';
    files["src/reports/index.ts"] = 'export { load } from "./renderReport";';
    files["src/reports/renderReport.ts"] = `import { renderReport } from "./renderUtils";
      export async function load() {
        const { default: Report } = await import("./Report.svelte");
        return { report: renderReport(Report) };
      }`;
    files["src/reports/renderUtils.ts"] = `import { render } from "svelte/server";
      export const renderReport = (component) => render(component).body;`;
    files["src/reports/Report.svelte"] =
      '<script>import ReportCard from "./ReportCard.svelte";</script><ReportCard />';
    files["src/reports/ReportCard.svelte"] =
      '<script>import QCard from "@quaffui/quaff/components/card/QCard.svelte"; import report from "./report.json";</script><QCard bordered>{report.title}</QCard>';
    files["src/reports/report.json"] = '{"title":"Server-rendered report"}';
  }

  for (const [name, source] of Object.entries(files)) {
    const file = join(root, name);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, source);
  }

  const config: InlineConfig = {
    root,
    configFile: false,
    envFile: false,
    logLevel: "silent",
    cacheDir: join(root, ".vite"),
    resolve: {
      alias: {
        $reports: join(root, "src/reports/index.ts"),
        "@quaffui/quaff/components/card/QCard.svelte": join(
          LIB_ROOT,
          "components/card/QCard.svelte"
        ),
      },
    },
    plugins: [
      createAssetsPlugin(
        { include: ["QSeparator"], css: { dev, stripUnused: true, safelist: ["q-mr-xs"] } },
        async (file) => {
          const css = readCssAsset(file);

          if (css === undefined) {
            throw new Error(`Unexpected Quaff CSS asset: ${file}`);
          }

          return css;
        }
      ),
      !isCssOnly && svelte({ configFile: false, preprocess: preprocessClasses("Q") }),
    ],
    build: {
      write: false,
      manifest: true,
      ssrManifest: true,
      minify: false,
      ...(cssCodeSplit === undefined ? {} : { cssCodeSplit }),
      ...(isCssOnly ? { rolldownOptions: { input: "virtual:quaff.css" } } : {}),
    },
    server: { host: "127.0.0.1", port: 0, fs: { allow: [root, MODULES_ROOT] } },
    optimizeDeps: { noDiscovery: true, include: [] },
  };
  const result = await build(config);

  if (Array.isArray(result) || !("output" in result)) {
    throw new Error("Expected a single completed Vite build.");
  }

  const assets = new Map(
    result.output
      .filter((file): file is Rollup.OutputAsset => file.type === "asset")
      .map((file) => [file.fileName, String(file.source)])
  );
  const manifest = JSON.parse(assets.get(".vite/manifest.json") ?? "null") as Manifest;
  const ssrManifest = JSON.parse(assets.get(".vite/ssr-manifest.json") ?? "null") as Record<
    string,
    string[]
  >;
  const stylesheets = new Map([...assets].filter(([name]) => name.endsWith(".css")));

  function readSsrCss(module: string) {
    return (ssrManifest[module] ?? [])
      .filter((file) => file.endsWith(".css"))
      .map((file) => stylesheets.get(file.replace(/^\//, "")))
      .join("\n");
  }

  return {
    assets,
    stylesheets,
    readEntryCss: (entry: string) => readManifestCss(manifest, stylesheets, entry),
    readSsrCss,
    async start() {
      const server = await createServer(config);
      onTestFinished(() => server.close());
      await server.listen();
      const address = server.httpServer?.address();

      if (!address || typeof address === "string") {
        throw new Error("Vite did not start the CSS fixture server.");
      }

      return {
        url: `http://127.0.0.1:${address.port}`,
        async renderReport() {
          const module = await server.ssrLoadModule("/src/routes/+page.server.ts");
          const result = await module.load();

          return result.report as string;
        },
      };
    },
    async updatePreset(className: string) {
      await writeFile(join(root, "src/preset.json"), JSON.stringify({ className }));
    },
    async addChipExample() {
      await writeFile(join(root, "src/routes/buttons/+page.svelte"), BUTTONS_SOURCE + CHIP_SOURCE);
    },
    async removeServerReport() {
      await writeFile(
        join(root, "src/reports/renderReport.ts"),
        'export const load = () => ({ report: "" });'
      );
    },
  };
}

function readManifestCss(manifest: Manifest, stylesheets: Map<string, string>, entry: string) {
  const pendingEntries = [entry];
  const visitedEntries = new Set<string>();
  const cssFiles = new Set<string>();

  while (pendingEntries.length) {
    const name = pendingEntries.pop();

    if (name === undefined || visitedEntries.has(name)) {
      continue;
    }

    visitedEntries.add(name);
    const chunk = manifest[name];

    if (!chunk) {
      throw new Error(`Missing build manifest entry: ${name}`);
    }

    for (const file of chunk.css ?? []) {
      cssFiles.add(file);
    }

    pendingEntries.push(...(chunk.imports ?? []).toReversed());
  }

  return [...cssFiles].map((file) => stylesheets.get(file)).join("\n");
}
