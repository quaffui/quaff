import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { analyzeSource } from "./cssExtractor.js";
import { CssPluginState, fileExists, normalizePath } from "./cssState.js";
import type {
  ComponentName,
  UTILITY_COMPONENT_DEPENDENCIES,
} from "../internal/componentRegistry.js";
import type { EnvironmentModuleNode, Plugin, ResolvedConfig, ViteDevServer } from "vite";

type CssExportName = ComponentName | keyof typeof UTILITY_COMPONENT_DEPENDENCIES;
type SafelistValue = RegExp | string;
type DevelopmentCssMode = "exact" | "full";

export interface QuaffCssComplexSafelist {
  deep?: readonly RegExp[];
  greedy?: readonly RegExp[];
  standard?: readonly SafelistValue[];
}

export type QuaffCssSafelist = QuaffCssComplexSafelist | readonly SafelistValue[];

export interface QuaffCssOptions {
  dev?: DevelopmentCssMode;
  exclude?: readonly CssExportName[];
  /** Component or utility exports used by code outside `sourceDir`. */
  include?: readonly CssExportName[];
  /** Remove unused base and utility selectors. Opt-in; safelist runtime-generated classes. */
  prune?: boolean;
  rootLayout?: false | string;
  /** Static selectors needed by runtime-generated classes. */
  safelist?: QuaffCssSafelist;
  /** Application source directory scanned for usage. Defaults to `src`. */
  sourceDir?: string;
}

const VIRTUAL_CSS_ID = "virtual:quaff.css";
const LEGACY_VIRTUAL_CSS_ID = "virtual:quaff/css";
// Keep SSR CSS discoverable and query imports inside Vite's allowed source root.
const VIRTUAL_CSS_PATH = "/@quaff/virtual.css";
const DEFAULT_ROOT_LAYOUT = "src/routes/+layout.svelte";
const PLUGIN_NAME = "quaff:css";

export function quaffCss(options: QuaffCssOptions = {}): Plugin {
  let config: ResolvedConfig;
  let devServer: ViteDevServer | undefined;
  let state: CssPluginState;
  let rootLayoutFile: string | undefined;
  let resolvedVirtualCssId: string;

  return {
    name: PLUGIN_NAME,
    enforce: "pre",
    config: CSS_MINIFIER_CONFIG,
    configResolved(resolvedConfig) {
      if (resolvedConfig.plugins.filter((plugin) => plugin.name === PLUGIN_NAME).length > 1) {
        throw new Error(
          `[quaff:css] More than one quaffCss() plugin is configured. Merge the options into one plugin instance.`
        );
      }

      config = resolvedConfig;
      resolvedVirtualCssId = resolveVirtualCssId(config.root);
      rootLayoutFile = resolveRootLayout(config.root, options.rootLayout);
      state = new CssPluginState(config, options, rootLayoutFile);
    },
    async buildStart() {
      // Build watchers can miss file creation events, so each build needs a fresh scan.
      if (config.command === "build") {
        state = new CssPluginState(config, options, rootLayoutFile);
      }

      await state.ensureInitialized();

      for (const target of state.getWatchTargets()) {
        this.addWatchFile(target);
      }

      for (const file of state.getFiles()) {
        this.addWatchFile(file);
      }
    },
    async watchChange(id, change) {
      if (!devServer || !state.isSourcePath(id)) {
        return;
      }

      const isHmrDisabled = devServer.config.server.hmr === false;
      const hasEnvironmentApi = "environments" in devServer;

      if (!isHmrDisabled && (hasEnvironmentApi || change.event === "update")) {
        return;
      }

      try {
        const hasCssChanged = await state.updateFile(change.event, id, () => readFile(id, "utf8"));

        if (!hasCssChanged) {
          return;
        }

        if (hasEnvironmentApi) {
          invalidateEnvironmentCss(devServer, Date.now());

          return;
        }

        const virtualModules = invalidateLegacyCss(devServer, Date.now());

        if (!isHmrDisabled) {
          for (const module of virtualModules) {
            await devServer.reloadModule(module);
          }
        }
      } catch (error) {
        reportDevelopmentError(devServer, error);
      }
    },
    configureServer(server) {
      devServer = server;
    },
    resolveId(id) {
      const { path, suffix } = splitId(id);

      if (
        path === VIRTUAL_CSS_ID ||
        path === LEGACY_VIRTUAL_CSS_ID ||
        path === VIRTUAL_CSS_PATH ||
        path === resolvedVirtualCssId
      ) {
        return `${resolvedVirtualCssId}${suffix}`;
      }
    },
    async load(id) {
      if (splitId(id).path !== resolvedVirtualCssId) {
        return;
      }

      return state.getStylesheet();
    },
    async transform(code, id) {
      if (
        !rootLayoutFile ||
        id.includes("?") ||
        normalizePath(id) !== normalizePath(rootLayoutFile)
      ) {
        return;
      }

      const usage = await analyzeSource(code, true);

      if (usage.hasVirtualCssImport || usage.hasFullCssImport) {
        return;
      }

      return {
        code: injectIntoSvelte(
          code,
          usage.instanceScriptContentStart,
          `import "${VIRTUAL_CSS_ID}";\n`
        ),
        map: null,
      };
    },
    async hotUpdate(update) {
      if (this.environment.name !== "client" || !state.isSourcePath(update.file)) {
        return;
      }

      const hasCssChanged = await state.updateFile(update.type, update.file, update.read);

      if (!hasCssChanged) {
        return;
      }

      const virtualModules = invalidateEnvironmentCss(update.server, update.timestamp);

      return appendUnique(update.modules, virtualModules);
    },
    async handleHotUpdate(update) {
      if (!state.isSourcePath(update.file)) {
        return;
      }

      const type = (await fileExists(update.file)) ? "update" : "delete";
      const hasCssChanged = await state.updateFile(type, update.file, update.read);

      if (!hasCssChanged) {
        return;
      }

      const virtualModules = invalidateLegacyCss(update.server, update.timestamp);

      return appendUnique(update.modules, virtualModules);
    },
  };
}

export function quaffCssMinifier(): Plugin {
  return {
    name: "quaff:css-minifier",
    config: CSS_MINIFIER_CONFIG,
  };
}

const CSS_MINIFIER_CONFIG: Plugin["config"] = {
  order: "post",
  handler: () => ({ build: { cssMinify: "esbuild" } }),
};

function resolveVirtualCssId(root: string) {
  return normalizePath(resolve(root, `.${VIRTUAL_CSS_PATH}`));
}

function resolveRootLayout(root: string, option: QuaffCssOptions["rootLayout"]) {
  return option === false ? undefined : resolve(root, option ?? DEFAULT_ROOT_LAYOUT);
}

function injectIntoSvelte(code: string, insertAt: number | undefined, imports: string) {
  if (insertAt === undefined) {
    return `<script>\n${imports}</script>\n${code}`;
  }

  return `${code.slice(0, insertAt)}\n${imports}${code.slice(insertAt)}`;
}

function invalidateEnvironmentCss(server: ViteDevServer, timestamp: number) {
  const resolvedVirtualCssId = resolveVirtualCssId(server.config.root);
  const clientModules: EnvironmentModuleNode[] = [];

  for (const [name, environment] of Object.entries(server.environments)) {
    for (const id of [resolvedVirtualCssId, `${resolvedVirtualCssId}?inline`]) {
      const module = environment.moduleGraph.getModuleById(id);

      if (!module) {
        continue;
      }

      environment.moduleGraph.invalidateModule(module, new Set(), timestamp, true);

      if (name === "client") {
        clientModules.push(module);
      }
    }
  }

  return clientModules;
}

function invalidateLegacyCss(server: ViteDevServer, timestamp: number) {
  const resolvedVirtualCssId = resolveVirtualCssId(server.config.root);
  const modules = [];

  for (const id of [resolvedVirtualCssId, `${resolvedVirtualCssId}?inline`]) {
    const module = server.moduleGraph.getModuleById(id);

    if (module) {
      server.moduleGraph.invalidateModule(module, new Set(), timestamp, true);
      modules.push(module);
    }
  }

  return modules;
}

function appendUnique<Value>(values: Value[], additions: Value[]) {
  return [...new Set([...values, ...additions])];
}

function reportDevelopmentError(server: ViteDevServer, error: unknown) {
  const problem = error instanceof Error ? error : new Error(String(error));

  server.config.logger.error(problem.message);
  server.ws.send({
    type: "error",
    err: {
      message: problem.message,
      plugin: PLUGIN_NAME,
      stack: problem.stack ?? problem.message,
    },
  });
}

function splitId(id: string) {
  const query = id.indexOf("?");

  return query === -1
    ? { path: id, suffix: "" }
    : { path: id.slice(0, query), suffix: id.slice(query) };
}
