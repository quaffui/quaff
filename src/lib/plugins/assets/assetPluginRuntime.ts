import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { COMPONENT_CSS, type ComponentCssName } from "../../internal/componentRegistry.js";
import { analyzeSource } from "./analyzeSource.js";
import { AssetUsageState, type CssAssetReader } from "./assetUsageState.js";
import { doesFileExist, normalizePath } from "./sourceFiles.js";
import { FontStylesheet } from "./fonts/fontStylesheet.js";
import type { QuaffAssetsOptions } from "./assetOptions.js";
import type {
  DevEnvironment,
  EnvironmentModuleNode,
  HmrContext,
  HotUpdateOptions,
  ResolvedConfig,
  ViteDevServer,
} from "vite";

const VIRTUAL_CSS_ID = "virtual:quaff.css";
const LEGACY_VIRTUAL_CSS_ID = "virtual:quaff/css";
const COMPONENT_CSS_PREFIX = "virtual:quaff/";
// Keep SSR CSS discoverable and query imports inside Vite's allowed source root.
const VIRTUAL_CSS_PATH = "/@quaff/virtual.css";
const DEFAULT_ROOT_LAYOUT = "src/routes/+layout.svelte";
export const ASSET_PLUGIN_NAME = "quaff:assets";
const FONT_SCSS_PATH = normalizePath(
  fileURLToPath(new URL("../../css/fonts.scss", import.meta.url))
);

type SourceChange = "create" | "delete" | "update";

/** Coordinates source usage, font output, and Vite's stylesheet lifecycle. */
export class AssetPluginRuntime {
  private config!: ResolvedConfig;
  private state!: AssetUsageState;
  private devServer: ViteDevServer | undefined;
  private rootLayoutFile: string | undefined;
  private virtualCssId = "";
  private fonts: FontStylesheet | undefined;
  private readonly componentStylesheets = new Map<string, ComponentCssName>();

  constructor(
    private readonly options: QuaffAssetsOptions,
    private readonly readCssFile?: CssAssetReader
  ) {}

  configure(config: ResolvedConfig) {
    const pluginCount = config.plugins.filter((plugin) => plugin.name === ASSET_PLUGIN_NAME).length;

    if (pluginCount > 1) {
      throw new Error(
        `[quaff:assets] More than one quaffAssets() plugin is configured. Merge the options into one plugin instance.`
      );
    }

    this.config = config;
    this.virtualCssId = resolveVirtualCssId(config.root);
    this.componentStylesheets.clear();

    for (const name of Object.values(COMPONENT_CSS)) {
      this.componentStylesheets.set(resolveVirtualCssId(config.root, `${name}.css`), name);
    }

    this.rootLayoutFile = resolveRootLayout(config.root, this.options.rootLayout);
    this.state = new AssetUsageState(config, this.options, this.rootLayoutFile, this.readCssFile);

    if (this.options.fonts) {
      this.fonts = new FontStylesheet(config, this.options.fonts);
    }
  }

  async initialize(watchFile: (file: string) => void) {
    // Build watchers can miss file creation events, so each build needs a fresh scan.
    if (this.config.command === "build") {
      this.state = new AssetUsageState(
        this.config,
        this.options,
        this.rootLayoutFile,
        this.readCssFile
      );
    }

    await this.state.ensureInitialized();

    for (const file of [...this.state.getWatchTargets(), ...this.state.getFiles()]) {
      watchFile(file);
    }
  }

  configureServer(server: ViteDevServer) {
    this.devServer = server;
    const fontDirectory = this.fonts?.assets.directory;

    if (fontDirectory && !server.config.server.fs.allow.includes(fontDirectory)) {
      server.config.server.fs.allow.push(fontDirectory);
    }
  }

  resolveImport(id: string) {
    const { path, suffix } = splitImportId(id);
    let componentId = path;

    if (path.startsWith(COMPONENT_CSS_PREFIX)) {
      componentId = resolveVirtualCssId(this.config.root, path.slice(COMPONENT_CSS_PREFIX.length));
    } else if (path.startsWith("/@quaff/")) {
      componentId = normalizePath(resolve(this.config.root, `.${path}`));
    }

    if (this.componentStylesheets.has(componentId)) {
      return `${componentId}${suffix}`;
    }

    const isStylesheetImport =
      path === VIRTUAL_CSS_ID ||
      path === LEGACY_VIRTUAL_CSS_ID ||
      path === VIRTUAL_CSS_PATH ||
      path === this.virtualCssId;
    const isManagedFontImport =
      !!this.fonts &&
      (path === "@quaffui/quaff/css/fonts.scss" || normalizePath(path) === FONT_SCSS_PATH);

    if (isStylesheetImport || isManagedFontImport) {
      return `${this.virtualCssId}${suffix}`;
    }
  }

  async loadStylesheet(id: string) {
    const path = splitImportId(id).path;
    const component = this.componentStylesheets.get(path);

    if (component) {
      return this.state.getComponentStylesheet(component);
    }

    if (path !== this.virtualCssId) {
      return;
    }

    const css = await this.state.getStylesheet();

    if (!this.fonts) {
      return css;
    }

    let fontUsage;

    if (this.fonts.needsUsage) {
      fontUsage = await this.state.getFontUsage();
    }

    const fontCss = await this.fonts.getStylesheet(fontUsage);

    return fontCss + css;
  }

  async injectStylesheetImport(code: string, id: string) {
    if (id.includes("?")) {
      return;
    }

    const isRootLayout = this.state.isRootLayout(id);
    const components = await this.state.getSourceStylesheets(id, code);

    if (!isRootLayout && !components.length) {
      return;
    }

    const isSvelte = id.endsWith(".svelte");
    const usage = await analyzeSource(code, isSvelte);
    const hasExistingStylesheet =
      usage.hasVirtualCssImport || (usage.hasFullCssImport && !this.fonts);
    const imports = components.map((name) => `import "${COMPONENT_CSS_PREFIX}${name}.css";`);

    if (isRootLayout && !hasExistingStylesheet) {
      imports.unshift(`import "${VIRTUAL_CSS_ID}";`);
    }

    if (!imports.length) {
      return;
    }

    const importCode = `${imports.join("\n")}\n`;
    let transformed = importCode + code;

    if (isSvelte) {
      transformed = injectIntoSvelte(code, usage.instanceScriptContentStart, importCode);
    }

    return {
      code: transformed,
      map: null,
    };
  }

  async updateEnvironmentSource(update: HotUpdateOptions) {
    if (!this.state.isSourcePath(update.file)) {
      return;
    }

    const { hasChanged, hasReloaded } = await this.updateSource(
      update.type,
      update.file,
      update.read
    );

    if (hasReloaded) {
      return [];
    }

    if (hasChanged) {
      const modules = invalidateEnvironmentCss(update.server, update.timestamp);

      return appendUnique(update.modules, modules);
    }
  }

  async updateLegacySource(update: HmrContext) {
    if (!this.state.isSourcePath(update.file)) {
      return;
    }

    const type = (await doesFileExist(update.file)) ? "update" : "delete";
    const { hasChanged, hasReloaded } = await this.updateSource(type, update.file, update.read);

    if (hasReloaded) {
      return [];
    }

    if (hasChanged) {
      const modules = invalidateLegacyCss(update.server, update.timestamp);

      return appendUnique(update.modules, modules);
    }
  }

  async updateWatchedSource(id: string, type: SourceChange) {
    const server = this.devServer;

    if (!server || !this.state.isSourcePath(id)) {
      return;
    }

    const isHmrDisabled = server.config.server.hmr === false;
    const usesEnvironmentApi = hasEnvironmentApi(server);
    const isHandledByHotUpdate = !isHmrDisabled && (usesEnvironmentApi || type === "update");

    if (isHandledByHotUpdate) {
      return;
    }

    try {
      const { hasChanged, hasReloaded } = await this.updateSource(type, id, () =>
        readFile(id, "utf8")
      );

      if (!hasChanged || hasReloaded) {
        return;
      }

      await this.refreshWatchedStylesheet(server);
    } catch (error) {
      reportDevelopmentError(server, error);
    }
  }

  private async updateSource(
    type: SourceChange,
    file: string,
    read: () => Promise<string> | string
  ) {
    const previousImports = this.state.getStylesheetImportKey();
    const hasChanged = await this.state.updateFile(type, file, read);
    const server = this.devServer;
    const hasReloaded = previousImports !== this.state.getStylesheetImportKey() && !!server;

    if (!hasReloaded || !server) {
      return { hasChanged, hasReloaded };
    }

    // Shared ownership changes imports elsewhere; established layers also need a fresh order.
    invalidateModuleGraphs(server);

    if (server.config.server.hmr !== false) {
      server.ws.send({ type: "full-reload" });
    }

    return { hasChanged, hasReloaded };
  }

  private async refreshWatchedStylesheet(server: ViteDevServer) {
    if (hasEnvironmentApi(server)) {
      invalidateEnvironmentCss(server, Date.now());

      return;
    }

    const modules = invalidateLegacyCss(server, Date.now());

    if (server.config.server.hmr === false) {
      return;
    }

    for (const module of modules) {
      await server.reloadModule(module);
    }
  }
}

function resolveVirtualCssId(root: string, stylesheet = "virtual.css") {
  return normalizePath(resolve(root, `./@quaff/${stylesheet}`));
}

function resolveRootLayout(root: string, option: QuaffAssetsOptions["rootLayout"]) {
  return option === false ? undefined : resolve(root, option ?? DEFAULT_ROOT_LAYOUT);
}

function injectIntoSvelte(code: string, insertAt: number | undefined, imports: string) {
  if (insertAt === undefined) {
    return `<script>\n${imports}</script>\n${code}`;
  }

  return `${code.slice(0, insertAt)}\n${imports}${code.slice(insertAt)}`;
}

function hasEnvironmentApi(server: ViteDevServer): boolean {
  return "environments" in server;
}

function invalidateModuleGraphs(server: ViteDevServer) {
  if (!hasEnvironmentApi(server)) {
    server.moduleGraph.invalidateAll();

    return;
  }

  for (const environment of Object.values(server.environments)) {
    environment.moduleGraph.invalidateAll();
  }
}

function invalidateEnvironmentCss(server: ViteDevServer, timestamp: number) {
  const virtualCssId = resolveVirtualCssId(server.config.root);
  const clientModules: EnvironmentModuleNode[] = [];

  for (const [name, environment] of Object.entries(server.environments)) {
    const modules = invalidateStylesheetModules(environment, virtualCssId, timestamp);

    if (name === "client") {
      clientModules.push(...modules);
    }
  }

  return clientModules;
}

function invalidateStylesheetModules(environment: DevEnvironment, id: string, timestamp: number) {
  const modules: EnvironmentModuleNode[] = [];

  for (const importId of [id, `${id}?inline`]) {
    const module = environment.moduleGraph.getModuleById(importId);

    if (!module) {
      continue;
    }

    environment.moduleGraph.invalidateModule(module, new Set(), timestamp, true);
    modules.push(module);
  }

  return modules;
}

function invalidateLegacyCss(server: ViteDevServer, timestamp: number) {
  const virtualCssId = resolveVirtualCssId(server.config.root);
  const modules = [];

  for (const id of [virtualCssId, `${virtualCssId}?inline`]) {
    const module = server.moduleGraph.getModuleById(id);

    if (!module) {
      continue;
    }

    server.moduleGraph.invalidateModule(module, new Set(), timestamp, true);
    modules.push(module);
  }

  return modules;
}

function appendUnique<Value>(values: Value[], additions: Value[]) {
  return [...new Set([...values, ...additions])];
}

function reportDevelopmentError(server: ViteDevServer, error: unknown) {
  const problem = error instanceof Error ? error : new Error(String(error));

  // Vite's logger reports errors; it is not asynchronous control flow.
  server.config.logger.error(problem.message);
  server.ws.send({
    type: "error",
    err: {
      message: problem.message,
      plugin: ASSET_PLUGIN_NAME,
      stack: problem.stack ?? problem.message,
    },
  });
}

function splitImportId(id: string) {
  const query = id.indexOf("?");

  if (query === -1) {
    return { path: id, suffix: "" };
  }

  return { path: id.slice(0, query), suffix: id.slice(query) };
}
