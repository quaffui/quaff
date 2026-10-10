import { readFile, realpath } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { COMPONENT_CSS, type ComponentCssName } from "../../internal/componentRegistry.js";
import { getOrCreateCachedValue } from "./promiseCache.js";
import { analyzeSource, type SourceUsage } from "./analyzeSource.js";
import { findSourceFiles, isSourceFile, doesFileExist, normalizePath } from "./sourceFiles.js";
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
  private readonly sourceRoots: string[];
  private readonly safelist: NormalizedSafelist;
  private safelistSelection: Promise<CssSelection> | undefined;
  private initialization: Promise<void> | undefined;
  private fontUsage: Promise<FontSourceUsage> | undefined;
  private processing = Promise.resolve();
  private currentCss = "";

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
    const selection = createCssSelection(sources, this.options, safelisted);
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

    if (path === this.rootLayoutFile) {
      return isSourceFile(path);
    }

    return (
      isSourceFile(path) &&
      this.sourceRoots.some((sourceRoot) => {
        const pathFromSource = relative(sourceRoot, path);

        return !!pathFromSource && !pathFromSource.startsWith("..") && !isAbsolute(pathFromSource);
      })
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

    return this.processFileUpdate(type, file, read);
  }

  private async initialize() {
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
      realDirectories: new Set<string>(),
      realFiles: new Set<string>(),
    };

    for (const sourceRoot of this.sourceRoots) {
      try {
        await findSourceFiles(sourceRoot, sourceFiles);
      } catch (error) {
        throw createProcessingError(sourceRoot, "scan the configured source directory", error);
      }
    }

    if (this.rootLayoutFile && (await doesFileExist(this.rootLayoutFile))) {
      const rootLayoutRealPath = await realpath(this.rootLayoutFile);

      if (!sourceFiles.realFiles.has(rootLayoutRealPath)) {
        sourceFiles.files.push(this.rootLayoutFile);
      }
    }

    return sourceFiles.files;
  }

  private async readSourceUsage(file: string) {
    try {
      const code = await readFile(file, "utf8");
      const usage = await analyzeSource(
        code,
        file === this.rootLayoutFile,
        this.shouldCollectFontTemplates()
      );
      this.sources.set(file, usage);
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

    try {
      if (type === "delete") {
        this.sources.delete(file);
      } else {
        const code = await read();
        const usage = await analyzeSource(
          code,
          file === this.rootLayoutFile,
          this.shouldCollectFontTemplates()
        );

        this.sources.set(file, usage);
      }

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

      this.handleDevelopmentError(file, "update CSS", error);

      return false;
    }
  }

  private async createStylesheet() {
    if (this.isFullCss()) {
      return this.readCssAsset("index");
    }

    if (this.rootLayoutFile && this.sources.get(this.rootLayoutFile)?.hasFullCssImport) {
      return EMPTY_CSS;
    }

    const safelisted = await this.getSafelistSelection();
    const selection = createCssSelection(this.sources.values(), this.options, safelisted);

    addCandidateComponentCss(selection);

    const base = await this.readCssAsset("base");
    const components: string[] = [];

    for (const name of CSS_ORDER) {
      if (selection.css.has(name)) {
        components.push(await this.readCssAsset(name));
      }
    }

    if (!this.options.css?.stripUnused) {
      return [base, ...components, ""].join("\n");
    }

    const strippedBase = await this.stripUnusedBaseCss(base, selection);

    return [strippedBase, ...components, ""].join("\n");
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

      return analyzeSource(css);
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

  private shouldCollectFontTemplates() {
    const icons = this.options.fonts?.icons;

    return !!(icons && icons.stripUnused);
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

  return (
    !hasSameValues(previous.candidates, next.candidates) ||
    !hasSameValues(previous.componentPaths, next.componentPaths)
  );
}

function hasSameValues(values: Set<string>, other: Set<string>) {
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
