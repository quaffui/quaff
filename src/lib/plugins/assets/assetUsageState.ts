import { readFile, realpath } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createFilter } from "@rollup/pluginutils";
import { COMPONENT_CSS, type ComponentCssName } from "../../internal/componentRegistry.js";
import { getOrCreateCachedValue } from "./promiseCache.js";
import { createCssLayerOrder } from "./cssLayerOrder.js";
import { collectSourceImports } from "./sourceImports.js";
import { analyzeSource, type SourceUsage } from "./analyzeSource.js";
import {
  findSourceFiles,
  isSourceFile,
  doesFileExist,
  normalizePath,
  canInjectStylesheet,
  isServerSource,
} from "./sourceFiles.js";
import {
  createCssSelection,
  normalizeSafelist,
  createClassPattern,
  addCandidateComponentCss,
  getBaseClass,
  type CssSelection,
  type NormalizedSafelist,
} from "./componentStyles.js";
import type { FontSourceUsage } from "./fonts/iconFontStylesheet.js";
import type { QuaffAssetsOptions } from "./assetOptions.js";
import type { ResolvedConfig } from "vite";

const CSS_ORDER = Object.values(COMPONENT_CSS);
const CSS_ASSET_ROOT = fileURLToPath(new URL("../../css/", import.meta.url));
const EMPTY_CSS = "/* Quaff CSS is provided by @quaffui/quaff/css/index.css. */\n";
const SCRIPT_SOURCE_PATTERN = /\.(?:svelte|[cm]?[jt]s)$/;
const BASE_CANDIDATES = [
  "html",
  "body",
  "div",
  "q-tooltip",
  "data-quaff-overlay",
  "label",
  "a",
  "b",
  "i",
  "span",
  "button",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
];

export type CssAssetReader = (file: string) => Promise<string>;

export class AssetUsageState {
  private readonly assetCache = new Map<string, string>();
  private readonly cssUsageCache = new Map<string, Promise<SourceUsage>>();
  private readonly sources = new Map<string, SourceUsage>();
  private readonly sourceAliases = new Map<string, string>();
  private readonly directoryAliases = new Map<string, string>();
  private readonly sharedSources = new Set<string>();
  private readonly serverEntries = new Set<string>();
  private readonly sourceImports = new Map<string, Promise<Set<string> | undefined>>();
  private readonly sourceRoots: string[];
  private readonly shouldIncludeSource: (file: string) => boolean;
  private readonly realSourceRoots = new Set<string>();
  private readonly safelist: NormalizedSafelist;
  private safelistSelection: Promise<CssSelection> | undefined;
  private initialization: Promise<void> | undefined;
  private fontUsage: Promise<FontSourceUsage> | undefined;
  private processing = Promise.resolve();
  private currentCss = "";
  private layerOrder = "";
  private layerStylesheetKey: string | undefined;
  private globalStylesheets = new Set<ComponentCssName>();
  private realRootLayout: string | undefined;
  private resolveImport: ReturnType<ResolvedConfig["createResolver"]> | undefined;

  constructor(
    private readonly config: ResolvedConfig,
    private readonly options: QuaffAssetsOptions,
    private readonly rootLayoutFile: string | undefined,
    private readonly readCssFile: CssAssetReader = (file) => readFile(file, "utf8")
  ) {
    const sourceDirectories = options.sourceDir ?? "src";
    const directories =
      typeof sourceDirectories === "string" ? [sourceDirectories] : sourceDirectories;
    this.sourceRoots = directories.map((directory) => resolve(config.root, directory));
    this.shouldIncludeSource = createFilter(undefined, [...(options.sourceExclude ?? [])], {
      resolve: config.root,
    });
    this.safelist = normalizeSafelist(options.css?.safelist);
  }

  async ensureInitialized() {
    this.initialization ??= this.initialize();
    await this.initialization;
  }

  async getStylesheet() {
    await this.ensureInitialized();

    return this.currentCss;
  }

  shouldSplitCss() {
    return (
      this.config.build?.cssCodeSplit !== false &&
      !this.isFullCss() &&
      !this.getRootLayoutUsage()?.hasFullCssImport
    );
  }

  getStylesheetImportKey() {
    if (!this.shouldSplitCss()) {
      return "full";
    }

    const globalStylesheets = CSS_ORDER.filter((name) => this.globalStylesheets.has(name));

    return `${this.layerOrder}\n${globalStylesheets.join(",")}`;
  }

  isRootLayout(file: string) {
    const path = resolve(file);

    return (
      path === this.rootLayoutFile ||
      path === this.realRootLayout ||
      path === this.sourceAliases.get(this.realRootLayout ?? "")
    );
  }

  async getSourceStylesheets(file: string, code: string) {
    await this.ensureInitialized();

    if (
      !this.shouldSplitCss() ||
      !this.isSourcePath(file) ||
      !this.canInjectSourceStylesheet(file)
    ) {
      return [];
    }

    const path = resolve(file);
    const source = this.getSourceAlias(path);
    let usage = this.sources.get(source);

    if (!usage) {
      usage = await analyzeSource(code);
    }

    const selection = createCssSelection(
      [usage],
      { ...this.options, include: [] },
      { keep: new Set(), candidates: new Set(), css: new Set(), components: new Set() }
    );
    addCandidateComponentCss(selection);

    return CSS_ORDER.filter((name) => selection.css.has(name) && !this.globalStylesheets.has(name));
  }

  async getComponentStylesheet(name: ComponentCssName) {
    await this.ensureInitialized();
    const css = await this.readCssAsset(name);

    return `${this.layerOrder}\n${css}`;
  }

  async getFontUsage() {
    await this.ensureInitialized();
    this.fontUsage ??= this.createFontUsage();
    const pending = this.fontUsage;

    try {
      return await pending;
    } catch (error) {
      if (this.fontUsage === pending) {
        this.fontUsage = undefined;
      }

      throw error;
    }
  }

  private async createFontUsage(): Promise<FontSourceUsage> {
    const sources = [...this.sources.values()];
    const safelisted = await this.getSafelistSelection();
    let fontSources = sources;

    if (this.shouldParseIconUsage()) {
      fontSources = sources.map((source) => ({
        ...source,
        candidates: new Set(source.iconUsage?.components ?? []),
        componentPaths: new Set(),
      }));
    }

    const selection = createCssSelection(fontSources, this.options, safelisted);
    addCandidateComponentCss(selection);
    const styles = await Promise.all([...selection.css].map((name) => this.readCssUsage(name)));

    return { sources: [...sources, ...styles], components: selection.components };
  }

  getFiles() {
    return this.sources.keys();
  }

  getWatchTargets() {
    return [...this.sourceRoots, ...(this.rootLayoutFile ? [dirname(this.rootLayoutFile)] : [])];
  }

  isSourcePath(file: string) {
    if (this.isFullCss() && !this.shouldCollectFontTemplates()) {
      return false;
    }

    const path = resolve(file);

    if (!this.isIncludedSource(path)) {
      return false;
    }

    if (path === this.rootLayoutFile || this.sourceAliases.has(path)) {
      return isSourceFile(path);
    }

    return (
      isSourceFile(path) &&
      (isInsideSourceRoot(path, this.sourceRoots) || isInsideSourceRoot(path, this.realSourceRoots))
    );
  }

  async updateFile(
    type: "create" | "delete" | "update",
    file: string,
    read: () => Promise<string> | string
  ) {
    const update = this.processQueuedUpdate(this.processing, type, resolve(file), read);
    this.processing = waitForUpdate(update);

    return update;
  }

  private async processQueuedUpdate(
    previousUpdate: Promise<void>,
    type: "create" | "delete" | "update",
    file: string,
    read: () => Promise<string> | string
  ) {
    await previousUpdate;
    await this.ensureInitialized();

    if (!this.isSourcePath(file)) {
      return false;
    }

    const source = this.getSourceAlias(file);

    return this.processFileUpdate(type, source, read);
  }

  private async initialize() {
    if (this.rootLayoutFile && (await doesFileExist(this.rootLayoutFile))) {
      this.realRootLayout = await realpath(this.rootLayoutFile);
    }

    if (this.isFullCss() && !this.shouldCollectFontTemplates()) {
      this.currentCss = await this.readCssAsset("index");

      return;
    }

    const files = await this.findTrackedFiles();

    for (const file of files) {
      await this.readSourceUsage(file);
    }

    this.currentCss = await this.createStylesheet();
  }

  private async findTrackedFiles() {
    const sourceFiles = {
      files: [] as string[],
      realDirectories: new Map<string, string>(),
      realFiles: new Set<string>(),
    };

    for (const sourceRoot of this.sourceRoots) {
      try {
        this.realSourceRoots.add(await realpath(sourceRoot));
        await findSourceFiles(sourceRoot, sourceFiles);
      } catch (error) {
        throw createProcessingError(sourceRoot, "scan the configured source directory", error);
      }
    }

    for (const [directory, alias] of sourceFiles.realDirectories) {
      if (directory !== alias) {
        this.directoryAliases.set(directory, alias);
      }

      if (!isInsideSourceRoot(directory, this.realSourceRoots)) {
        this.realSourceRoots.add(directory);
      }
    }

    if (
      this.rootLayoutFile &&
      this.realRootLayout &&
      !sourceFiles.realFiles.has(this.realRootLayout)
    ) {
      sourceFiles.files.push(this.rootLayoutFile);
    }

    return sourceFiles.files;
  }

  private async readSourceUsage(file: string) {
    try {
      const realFile = await realpath(file);
      this.sourceAliases.set(realFile, file);

      if (!this.isIncludedSource(realFile)) {
        return;
      }

      const code = await readFile(file, "utf8");
      const usage = await analyzeSource(
        code,
        this.isRootLayout(realFile),
        this.shouldCollectFontTemplates(),
        this.getIconSourceOptions(file)
      );
      this.setSourceUsage(file, realFile, usage, code);
    } catch (error) {
      if (this.config.command !== "serve") {
        throw createProcessingError(file, "extract CSS usage", error);
      }

      this.config.logger.warn(
        `[quaff:assets] Skipping ${this.getDisplayPath(file)} until it can be read: ${getErrorMessage(error)}`
      );
    }
  }

  private async processFileUpdate(
    type: "create" | "delete" | "update",
    file: string,
    read: () => Promise<string> | string
  ) {
    const previous = this.sources.get(file);
    const isPreviouslyShared = this.sharedSources.has(file);
    const isPreviousServerEntry = this.serverEntries.has(file);

    try {
      await this.updateSourceUsage(type, file, read);
      const stylesheet = await this.createStylesheet();
      const hasUsageChanged = hasFontUsageChanged(previous, this.sources.get(file));
      const hasStylesheetChanged = stylesheet !== this.currentCss;
      const hasIconUsageChanged = this.shouldCollectFontTemplates() && hasUsageChanged;

      if (hasUsageChanged) {
        this.fontUsage = undefined;
      }

      this.currentCss = stylesheet;

      return hasStylesheetChanged || hasIconUsageChanged;
    } catch (error) {
      if (previous) {
        this.sources.set(file, previous);
      } else {
        this.sources.delete(file);
      }

      if (isPreviouslyShared) {
        this.sharedSources.add(file);
      } else {
        this.sharedSources.delete(file);
      }

      if (isPreviousServerEntry) {
        this.serverEntries.add(file);
      } else {
        this.serverEntries.delete(file);
      }

      this.sourceImports.delete(file);

      this.handleDevelopmentError(file, "update CSS", error);

      return false;
    }
  }

  private async createStylesheet() {
    if (this.isFullCss()) {
      return this.readCssAsset("index");
    }

    if (this.getRootLayoutUsage()?.hasFullCssImport) {
      return EMPTY_CSS;
    }

    const safelisted = await this.getSafelistSelection();
    const selection = createCssSelection(this.sources.values(), this.options, safelisted);

    addCandidateComponentCss(selection);

    const base = await this.readCssAsset("base");
    const components = new Map<ComponentCssName, string>();

    for (const name of CSS_ORDER) {
      if (selection.css.has(name)) {
        components.set(name, await this.readCssAsset(name));
      }
    }

    let baseCss = base;

    if (this.options.css?.stripUnused) {
      baseCss = await this.stripUnusedBaseCss(base, selection);
    }

    if (!this.shouldSplitCss()) {
      return [baseCss, ...components.values(), ""].join("\n");
    }

    const serverSources = await this.collectServerSources();
    const globalSources = [...this.sources].filter(
      ([file]) => serverSources.has(file) || !this.canInjectSourceStylesheet(file)
    );
    const globalSelection = createCssSelection(
      globalSources.map(([, usage]) => usage),
      this.options,
      safelisted
    );
    addCandidateComponentCss(globalSelection);
    const globalStyles = [...components].filter(([name]) => globalSelection.css.has(name));
    const layerStylesheetKey = [...components.keys()].join(",");

    if (layerStylesheetKey !== this.layerStylesheetKey) {
      this.layerOrder = createCssLayerOrder([base, ...components.values()]);
      this.layerStylesheetKey = layerStylesheetKey;
    }

    this.globalStylesheets = globalSelection.css;

    return [this.layerOrder, baseCss, ...globalStyles.map(([, css]) => css), ""].join("\n");
  }

  private async stripUnusedBaseCss(base: string, selection: CssSelection) {
    const { PurgeCSS } = await import("purgecss");
    const rawContent = [...BASE_CANDIDATES, ...selection.candidates].join("\n");
    const componentPatterns = [...selection.keep].map(createClassPattern);
    const results = await new PurgeCSS().purge({
      content: [{ extension: "html", raw: rawContent }],
      css: [{ raw: base }],
      fontFace: false,
      keyframes: true,
      safelist: {
        deep: this.safelist.deep,
        greedy: this.safelist.greedy,
        standard: [...componentPatterns, ...this.safelist.standard],
      },
      variables: false,
    });
    return results[0]?.css ?? "";
  }

  private getSafelistSelection() {
    this.safelistSelection ??= this.createSafelistSelection();

    return this.safelistSelection;
  }

  private async createSafelistSelection(): Promise<CssSelection> {
    const { standard, deep, greedy } = this.safelist;
    const selection: CssSelection = {
      keep: new Set(),
      candidates: new Set(standard.filter((value): value is string => typeof value === "string")),
      css: new Set(),
      components: new Set(),
    };
    const patterns = [...standard, ...deep, ...greedy].filter(
      (value): value is RegExp => value instanceof RegExp
    );

    if (!patterns.length && !selection.candidates.size) {
      return selection;
    }

    for (const name of CSS_ORDER) {
      const css = await this.readCssAsset(name);
      addSafelistedCss(selection, name, css, patterns);
    }

    return selection;
  }

  private async readCssAsset(name: string) {
    const cached = this.assetCache.get(name);

    if (cached !== undefined) {
      return cached;
    }

    const file = resolve(CSS_ASSET_ROOT, `${name}.css`);

    try {
      const css = await this.readCssFile(file);

      this.assetCache.set(name, css);

      return css;
    } catch (error) {
      throw createProcessingError(file, `read the Quaff CSS asset ${JSON.stringify(name)}`, error);
    }
  }

  private readCssUsage(name: string): Promise<SourceUsage> {
    return getOrCreateCachedValue(this.cssUsageCache, name, async () => {
      const css = await this.readCssAsset(name);

      return analyzeSource(css, false, false, this.getIconSourceOptions(`${name}.css`));
    });
  }

  private handleDevelopmentError(file: string, action: string, error: unknown) {
    if (this.config.command !== "serve") {
      throw createProcessingError(file, action, error);
    }

    this.config.logger.warn(
      `[quaff:assets] Keeping the last valid stylesheet because ${this.getDisplayPath(file)} failed to ${action}: ${getErrorMessage(error)}`
    );
  }

  private getDisplayPath(file: string) {
    return normalizePath(relative(this.config.root, file));
  }

  private isFullCss() {
    return this.config.command === "serve" && this.options.css?.dev === "full";
  }

  private getRootLayoutUsage() {
    const source = this.sourceAliases.get(this.realRootLayout ?? "") ?? this.rootLayoutFile;

    return this.sources.get(source ?? "");
  }

  private async updateSourceUsage(
    type: "create" | "delete" | "update",
    file: string,
    read: () => Promise<string> | string
  ) {
    if (type === "delete") {
      this.removeSourceUsage(file);

      return;
    }

    const code = await read();
    const realFile = await realpath(file);
    this.sourceAliases.set(realFile, file);

    if (!this.isIncludedSource(realFile)) {
      this.removeSourceUsage(file);

      return;
    }

    const usage = await analyzeSource(
      code,
      this.isRootLayout(realFile),
      this.shouldCollectFontTemplates(),
      this.getIconSourceOptions(file)
    );
    this.setSourceUsage(file, realFile, usage, code);
  }

  private removeSourceUsage(file: string) {
    this.sources.delete(file);
    this.sharedSources.delete(file);
    this.serverEntries.delete(file);
    this.sourceImports.delete(file);
  }

  private setSourceUsage(file: string, realFile: string, usage: SourceUsage, code: string) {
    this.sources.set(file, usage);
    this.sourceImports.delete(file);

    if (isServerSource(file) || isServerSource(realFile) || code.includes("svelte/server")) {
      this.serverEntries.add(file);
    } else {
      this.serverEntries.delete(file);
    }

    if (canInjectStylesheet(file) && !canInjectStylesheet(realFile)) {
      this.sharedSources.add(file);
    } else {
      this.sharedSources.delete(file);
    }
  }

  private async collectServerSources() {
    const pending = [...this.serverEntries];
    const sources = new Set<string>();

    while (pending.length) {
      const file = pending.pop();

      if (!file || sources.has(file)) {
        continue;
      }

      sources.add(file);

      if (!SCRIPT_SOURCE_PATTERN.test(file)) {
        continue;
      }

      const imports = await getOrCreateCachedValue(this.sourceImports, file, async () => {
        const code = await readFile(file, "utf8");

        return collectSourceImports(code);
      });

      if (!imports) {
        // Computed server imports can render any tracked component.
        return new Set(this.sources.keys());
      }

      const dependencies = await this.resolveSourceImports(file, imports);

      if (!dependencies) {
        return new Set(this.sources.keys());
      }

      pending.push(...dependencies);
    }

    return sources;
  }

  private async resolveSourceImports(file: string, imports: Set<string>) {
    const sources: string[] = [];

    for (const id of imports) {
      this.resolveImport ??= this.config.createResolver();
      const resolved = await this.resolveImport(id, file, false, !!this.config.environments?.ssr);

      if (!resolved) {
        // A custom Vite resolver may provide a component that this scan cannot locate.
        return;
      }

      const source = this.getSourceAlias(resolve(resolved.split("?", 1)[0]));

      if (this.sources.has(source)) {
        sources.push(source);
      }
    }

    return sources;
  }

  private canInjectSourceStylesheet(file: string) {
    const path = resolve(file);
    const source = this.getSourceAlias(path);

    return canInjectStylesheet(source) && !this.sharedSources.has(source);
  }

  private isIncludedSource(file: string) {
    const source = this.getSourceAlias(file);

    return (
      this.isRootLayout(file) ||
      (this.shouldIncludeSource(file) && this.shouldIncludeSource(source))
    );
  }

  private getSourceAlias(file: string) {
    const source = this.sourceAliases.get(file);

    if (source) {
      return source;
    }

    // New files can arrive through a symlink's real directory before being scanned.
    let directory = dirname(file);

    while (directory !== dirname(directory)) {
      const alias = this.directoryAliases.get(directory);

      if (alias) {
        return resolve(alias, relative(directory, file));
      }

      directory = dirname(directory);
    }

    return file;
  }

  private shouldCollectFontTemplates() {
    const icons = this.options.fonts?.icons;

    return !!(icons && icons.stripUnused);
  }

  private shouldParseIconUsage() {
    const icons = this.options.fonts?.icons;

    return !!(icons && icons.stripUnused && icons.strategy === "hard");
  }

  private getIconSourceOptions(file: string) {
    if (this.shouldParseIconUsage()) {
      return { file };
    }
  }
}

async function waitForUpdate(update: Promise<boolean>) {
  try {
    await update;
  } catch {
    // The caller receives the failure; the next queued update must still run.
  }
}

function addSafelistedCss(
  selection: CssSelection,
  name: ComponentCssName,
  css: string,
  patterns: RegExp[]
) {
  for (const [, className] of css.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)) {
    const isSafelisted =
      selection.candidates.has(className) || patterns.some((pattern) => pattern.test(className));

    if (!isSafelisted) {
      continue;
    }

    selection.css.add(name);
    const baseClass = getBaseClass(className);

    if (baseClass) {
      selection.keep.add(baseClass);
    }
  }
}

function hasFontUsageChanged(previous: SourceUsage | undefined, next: SourceUsage | undefined) {
  if (!previous || !next) {
    return previous !== next;
  }

  if (previous.iconUsage && next.iconUsage) {
    return (
      !hasSameValues(previous.iconUsage.names, next.iconUsage.names) ||
      !hasSameValues(previous.iconUsage.components, next.iconUsage.components) ||
      getUnresolvedIconKey(previous) !== getUnresolvedIconKey(next)
    );
  }

  return (
    !hasSameValues(previous.candidates, next.candidates) ||
    !hasSameValues(previous.componentPaths, next.componentPaths)
  );
}

function getUnresolvedIconKey(source: SourceUsage) {
  return JSON.stringify(
    source.iconUsage?.unresolved.map(({ expression, reason }) => [expression, reason])
  );
}

function hasSameValues(values: ReadonlySet<string>, other: ReadonlySet<string>) {
  return values.size === other.size && [...values].every((value) => other.has(value));
}

function createProcessingError(file: string, action: string, error: unknown) {
  return new Error(`[quaff:assets] Failed to ${action} for ${file}: ${getErrorMessage(error)}`, {
    cause: error,
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isInsideSourceRoot(path: string, roots: Iterable<string>) {
  for (const root of roots) {
    const relativePath = normalizePath(relative(root, path));

    if (relativePath !== ".." && !relativePath.startsWith("../") && !isAbsolute(relativePath)) {
      return true;
    }
  }

  return false;
}
