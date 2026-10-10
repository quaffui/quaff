import { readFile } from "node:fs/promises";
import { basename, isAbsolute, relative, resolve } from "node:path";
import { preprocessCSS } from "vite";
import { createAssetsPlugin } from "../lib/plugins/assets/assetPlugin.js";
import { DOCS_ASSET_OPTIONS } from "./docsAssets.js";
import type { Plugin, ResolvedConfig } from "vite";

const LIBRARY_ROOT = resolve(import.meta.dirname, "../lib");
const LIBRARY_SOURCE_PATTERN = /\.(?:svelte|[cm]?[jt]s)$/;
const GENERATED_SOURCE_PATTERN =
  /^(?:docs(?:\.(?:props|snippets))?\.ts|.*\.(?:test|spec)\.[cm]?[jt]s)$/;

/** Use the published pruning pipeline with live source styles during docs development. */
export function createDocsAssetsPlugin(): Plugin[] {
  let config: ResolvedConfig;
  const styleDependencies = new Set<string>();

  async function readSourceCss(file: string) {
    const sourceFile = file.replace(/\.css$/, ".scss");
    const source = await readFile(sourceFile, "utf8");
    const compiled = await preprocessCSS(source, sourceFile, config);

    styleDependencies.add(sourceFile);

    for (const dependency of compiled.deps ?? []) {
      styleDependencies.add(dependency);
    }

    return compiled.code;
  }

  return [
    {
      name: "quaff:docs-source-styles",
      configResolved(resolvedConfig) {
        config = resolvedConfig;
      },
      async hotUpdate({ file, server }) {
        if (this.environment.name !== "client") {
          return;
        }

        const libraryPath = relative(LIBRARY_ROOT, file);
        const isLibrarySource =
          !libraryPath.startsWith("..") &&
          !isAbsolute(libraryPath) &&
          LIBRARY_SOURCE_PATTERN.test(file) &&
          !GENERATED_SOURCE_PATTERN.test(basename(file));

        if (styleDependencies.has(file) || isLibrarySource) {
          // Recreate the stylesheet and component-icon caches from the edited sources.
          await server.restart();

          return [];
        }
      },
    },
    createAssetsPlugin(DOCS_ASSET_OPTIONS, readSourceCss),
  ];
}
