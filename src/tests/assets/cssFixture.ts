import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { compile } from "sass";
import { AssetUsageState } from "../../lib/plugins/assets/assetUsageState";
import type { QuaffAssetsOptions } from "../../lib/plugins/assets";
import type { ResolvedConfig } from "vite";

const LIB_ROOT = fileURLToPath(new URL("../../lib/", import.meta.url));
const CSS_ROOT = join(LIB_ROOT, "css");
const cssCache = new Map<string, string>();
const directories = new Set<string>();

// Stand in only for the package's built CSS assets. Compile the actual source once,
// so these tests can run in a clean checkout without a preceding package build.
export function readCssAsset(path: unknown): string | undefined {
  if (typeof path !== "string" || !path.startsWith(`${CSS_ROOT}/`) || !path.endsWith(".css")) {
    return;
  }

  return getCssAsset(relative(CSS_ROOT, path).slice(0, -4));
}

export function getCssAsset(name: string): string {
  let css = cssCache.get(name);

  if (css === undefined) {
    css = compile(join(CSS_ROOT, `${name}.scss`), {
      importers: [
        {
          findFileUrl(url) {
            if (url.startsWith("$css/")) {
              return pathToFileURL(resolve(CSS_ROOT, url.slice(5)));
            }

            if (url.startsWith("$components/")) {
              return pathToFileURL(resolve(LIB_ROOT, "components", url.slice(12)));
            }

            return null;
          },
        },
      ],
    }).css;
    cssCache.set(name, css);
  }

  return css;
}

export async function createCssFixture(
  files: Record<string, string> = {},
  options: QuaffAssetsOptions = {}
) {
  const root = await mkdtemp(join(tmpdir(), "quaff-css-"));
  directories.add(root);
  const source = join(root, "src");
  await mkdir(source);

  async function write(name: string, content: string) {
    const path = join(source, name);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
    return path;
  }

  for (const [name, content] of Object.entries(files)) {
    await write(name, content);
  }

  const state = new AssetUsageState(
    { root, command: "build" } as ResolvedConfig,
    options,
    undefined
  );

  return {
    getStylesheet: () => state.getStylesheet(),
    getFontUsage: () => state.getFontUsage(),
    async update(name: string, content: string) {
      const path = await write(name, content);
      return state.updateFile("update", path, () => readFile(path, "utf8"));
    },
    async remove(name: string) {
      const path = join(source, name);
      await rm(path);
      return state.updateFile("delete", path, () => readFile(path, "utf8"));
    },
  };
}

export async function cleanupCssFixtures() {
  await Promise.all(
    [...directories].map((directory) => rm(directory, { recursive: true, force: true }))
  );
  directories.clear();
}

export function hasSelector(css: string, selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${escaped}(?=\\s*[,\\{])`).test(css);
}
