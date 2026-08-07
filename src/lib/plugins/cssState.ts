import { access, readdir, readFile, realpath, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  COMPONENT_BLOCK_CSS_DEPENDENCIES,
  COMPONENT_CSS,
  COMPONENT_METADATA,
  COMPONENT_NAMES_BY_IMPORT_PATH,
  UTILITY_COMPONENT_DEPENDENCIES,
  type ComponentCssName,
  type ComponentName,
} from "../internal/componentRegistry.js";
import { analyzeSource, type SourceUsage } from "./cssExtractor.js";
import type { QuaffCssComplexSafelist, QuaffCssOptions, QuaffCssSafelist } from "./css.js";
import type { ResolvedConfig } from "vite";

type UtilityName = Extract<keyof typeof UTILITY_COMPONENT_DEPENDENCIES, string>;

const SOURCE_FILE_PATTERN = /\.(?:svelte|html|[cm]?[jt]s|md|svx)$/;
const DECLARATION_FILE_PATTERN = /\.d\.[cm]?[jt]s$/;
const CSS_ORDER = Object.values(COMPONENT_CSS);
const CSS_ASSET_ROOT = fileURLToPath(new URL("../css/", import.meta.url));
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

export class CssPluginState {
  private readonly assetCache = new Map<string, string>();
  private readonly sources = new Map<string, SourceUsage>();
  private readonly sourceRoot: string;
  private readonly safelist: NormalizedSafelist;
  private safelistSelection: Promise<CssSelection> | undefined;
  private initialization: Promise<void> | undefined;
  private processing = Promise.resolve();
  private currentCss = "";

  constructor(
    private readonly config: ResolvedConfig,
    private readonly options: QuaffCssOptions,
    private readonly rootLayoutFile: string | undefined
  ) {
    this.sourceRoot = resolve(config.root, options.sourceDir ?? "src");
    this.safelist = normalizeSafelist(options.safelist);
  }

  async ensureInitialized() {
    this.initialization ??= this.initialize();
    await this.initialization;
  }

  async getStylesheet() {
    await this.ensureInitialized();

    return this.currentCss;
  }

  getFiles() {
    return this.sources.keys();
  }

  getWatchTargets() {
    return [this.sourceRoot, ...(this.rootLayoutFile ? [dirname(this.rootLayoutFile)] : [])];
  }

  isSourcePath(file: string) {
    if (this.isFullCss()) {
      return false;
    }

    const path = resolve(file);

    if (path === this.rootLayoutFile) {
      return isSourceFile(path);
    }

    const pathFromSource = relative(this.sourceRoot, path);

    return (
      Boolean(pathFromSource) &&
      !pathFromSource.startsWith("..") &&
      !isAbsolute(pathFromSource) &&
      isSourceFile(path)
    );
  }

  updateFile(
    type: "create" | "delete" | "update",
    file: string,
    read: () => Promise<string> | string
  ) {
    const update = this.processing.then(async () => {
      await this.ensureInitialized();

      return this.processFileUpdate(type, resolve(file), read);
    });

    this.processing = update.then(
      () => undefined,
      () => undefined
    );

    return update;
  }

  private async initialize() {
    if (this.isFullCss()) {
      this.currentCss = await this.readCssAsset("index");

      return;
    }

    let files: string[];

    try {
      const sourceFiles = await findSourceFiles(this.sourceRoot);

      files = sourceFiles.files;

      if (this.rootLayoutFile && (await fileExists(this.rootLayoutFile))) {
        const rootLayoutRealPath = await realpath(this.rootLayoutFile);

        if (!sourceFiles.realFiles.has(rootLayoutRealPath)) {
          files.push(this.rootLayoutFile);
        }
      }
    } catch (error) {
      throw createProcessingError(this.sourceRoot, "scan the configured source directory", error);
    }

    for (const file of files) {
      try {
        const usage = await analyzeSource(
          await readFile(file, "utf8"),
          file === this.rootLayoutFile
        );

        this.sources.set(file, usage);
      } catch (error) {
        if (this.config.command !== "serve") {
          throw createProcessingError(file, "extract CSS usage", error);
        }

        this.config.logger.warn(
          `[quaff:css] Skipping ${this.getDisplayPath(file)} until it can be read: ${getErrorMessage(error)}`
        );
      }
    }

    this.currentCss = await this.createStylesheet();
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
        const usage = await analyzeSource(await read(), file === this.rootLayoutFile);

        this.sources.set(file, usage);
      }

      const stylesheet = await this.createStylesheet();
      const hasChanged = stylesheet !== this.currentCss;

      this.currentCss = stylesheet;

      return hasChanged;
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
    if (this.rootLayoutFile && this.sources.get(this.rootLayoutFile)?.hasFullCssImport) {
      return EMPTY_CSS;
    }

    const safelisted = await (this.safelistSelection ??= this.createSafelistSelection());
    const selection = createCssSelection(this.sources.values(), this.options, safelisted);

    addCandidateComponentCss(selection);

    const base = await this.readCssAsset("base");
    const components: string[] = [];

    for (const name of CSS_ORDER) {
      if (selection.css.has(name)) {
        components.push(await this.readCssAsset(name));
      }
    }

    if (!this.options.prune) {
      return [base, ...components, ""].join("\n");
    }

    const { PurgeCSS } = await import("purgecss");
    const rawContent = [...BASE_CANDIDATES, ...selection.candidates].join("\n");
    const results = await new PurgeCSS().purge({
      content: [{ extension: "html", raw: rawContent }],
      css: [{ raw: base }],
      fontFace: false,
      keyframes: true,
      safelist: {
        deep: this.safelist.deep,
        greedy: [...[...selection.blocks].map(createBemPattern), ...this.safelist.greedy],
        standard: this.safelist.standard,
      },
      variables: false,
    });
    return [results[0]?.css ?? "", ...components, ""].join("\n");
  }

  private async createSafelistSelection(): Promise<CssSelection> {
    const { standard, deep, greedy } = this.safelist;
    const selection: CssSelection = {
      blocks: new Set(),
      candidates: new Set(standard.filter((value): value is string => typeof value === "string")),
      css: new Set(),
    };
    const patterns = [...standard, ...deep, ...greedy].filter(
      (value): value is RegExp => value instanceof RegExp
    );

    if (!patterns.length && !selection.candidates.size) {
      return selection;
    }

    for (const name of CSS_ORDER) {
      const css = await this.readCssAsset(name);

      for (const [, className] of css.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)) {
        if (
          !selection.candidates.has(className) &&
          !patterns.some((pattern) => pattern.test(className))
        ) {
          continue;
        }

        selection.css.add(name);
        const block = getComponentBlock(className);

        if (block) {
          selection.blocks.add(block);
        }
      }
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
      const css = await readFile(file, "utf8");

      this.assetCache.set(name, css);

      return css;
    } catch (error) {
      throw createProcessingError(file, `read the Quaff CSS asset ${JSON.stringify(name)}`, error);
    }
  }

  private handleDevelopmentError(file: string, action: string, error: unknown) {
    if (this.config.command !== "serve") {
      throw createProcessingError(file, action, error);
    }

    this.config.logger.warn(
      `[quaff:css] Keeping the last valid stylesheet because ${this.getDisplayPath(file)} failed to ${action}: ${getErrorMessage(error)}`
    );
  }

  private getDisplayPath(file: string) {
    return normalizePath(relative(this.config.root, file));
  }

  private isFullCss() {
    return this.config.command === "serve" && this.options.dev === "full";
  }
}

interface CssSelection {
  blocks: Set<string>;
  candidates: Set<string>;
  css: Set<ComponentCssName>;
}

function createCssSelection(
  sources: Iterable<SourceUsage>,
  options: QuaffCssOptions,
  safelisted: CssSelection
): CssSelection {
  const selection: CssSelection = {
    blocks: new Set(safelisted.blocks),
    candidates: new Set(safelisted.candidates),
    css: new Set(safelisted.css),
  };
  const requestedComponents = new Set(options.include ?? []);

  for (const source of sources) {
    addAll(selection.candidates, source.candidates);

    for (const importPath of source.componentPaths) {
      addAll(requestedComponents, getImportedComponents(importPath));
    }
  }

  for (const candidate of selection.candidates) {
    if (isComponentName(candidate) || isUtilityName(candidate)) {
      requestedComponents.add(candidate);
    }
  }

  for (const excluded of options.exclude ?? []) {
    requestedComponents.delete(excluded);
  }

  for (const requested of requestedComponents) {
    const components = isUtilityName(requested)
      ? UTILITY_COMPONENT_DEPENDENCIES[requested]
      : [requested];

    for (const component of components) {
      if (isComponentName(component)) {
        addComponent(selection, component);
      }
    }
  }

  return selection;
}

function getImportedComponents(importPath: string) {
  const component =
    COMPONENT_NAMES_BY_IMPORT_PATH[importPath] ??
    COMPONENT_NAMES_BY_IMPORT_PATH[`${importPath}.svelte`];

  if (component) {
    return [component];
  }

  const directory = `${importPath.split("/", 1)[0]}/`;

  return Object.entries(COMPONENT_NAMES_BY_IMPORT_PATH)
    .filter(([path]) => path.startsWith(directory))
    .map(([, name]) => name);
}

function addComponent(selection: CssSelection, component: ComponentName) {
  const metadata = COMPONENT_METADATA[component];

  addAll(selection.blocks, metadata.blocks);
  addAll(selection.candidates, metadata.helpers);
  addAll(selection.css, metadata.css);
}

interface NormalizedSafelist {
  deep: RegExp[];
  greedy: RegExp[];
  standard: (RegExp | string)[];
}

function normalizeSafelist(safelist: QuaffCssSafelist | undefined): NormalizedSafelist {
  const {
    deep = [],
    greedy = [],
    standard = [],
  } = (
    Array.isArray(safelist) ? { standard: safelist } : (safelist ?? {})
  ) as QuaffCssComplexSafelist;

  return {
    deep: deep.map(cloneSafelistPattern),
    greedy: greedy.map(cloneSafelistPattern),
    standard: standard.map(cloneSafelistValue),
  };
}

function cloneSafelistValue(value: RegExp | string) {
  return typeof value === "string" ? value : cloneSafelistPattern(value);
}

function cloneSafelistPattern(pattern: RegExp) {
  return new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ""));
}

interface SourceFiles {
  files: string[];
  realDirectories: Set<string>;
  realFiles: Set<string>;
}

async function findSourceFiles(
  dir: string,
  sourceFiles: SourceFiles = {
    files: [],
    realDirectories: new Set(),
    realFiles: new Set(),
  }
): Promise<SourceFiles> {
  const realDirectory = await realpath(dir);

  if (sourceFiles.realDirectories.has(realDirectory)) {
    return sourceFiles;
  }

  sourceFiles.realDirectories.add(realDirectory);

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    let isDirectory = entry.isDirectory();

    if (entry.isSymbolicLink()) {
      try {
        isDirectory = (await stat(path)).isDirectory();
      } catch (error) {
        if (isMissingPathError(error) && !isSourceFile(path)) {
          continue;
        }

        throw error;
      }
    }

    if (isDirectory) {
      if (![".svelte-kit", "node_modules"].includes(entry.name)) {
        await findSourceFiles(path, sourceFiles);
      }

      continue;
    }

    if (isSourceFile(path)) {
      const realFile = await realpath(path);

      if (!sourceFiles.realFiles.has(realFile)) {
        sourceFiles.files.push(path);
        sourceFiles.realFiles.add(realFile);
      }
    }
  }

  return sourceFiles;
}

function isSourceFile(file: string) {
  return SOURCE_FILE_PATTERN.test(file) && !DECLARATION_FILE_PATTERN.test(file);
}

function createBemPattern(block: string) {
  return new RegExp(`^${block}(?:$|--|__)`);
}

function addCandidateComponentCss(selection: CssSelection) {
  for (const candidate of selection.candidates) {
    const block = getComponentBlock(candidate);

    if (!block || !Object.hasOwn(COMPONENT_BLOCK_CSS_DEPENDENCIES, block)) {
      continue;
    }

    selection.blocks.add(block);
    addAll(selection.css, COMPONENT_BLOCK_CSS_DEPENDENCIES[block]);
  }
}

function getComponentBlock(candidate: string) {
  return candidate.startsWith("q-") ? candidate.split(/--|__/, 1)[0] : undefined;
}

function isComponentName(value: string): value is ComponentName {
  return Object.hasOwn(COMPONENT_METADATA, value);
}

function isUtilityName(value: string): value is UtilityName {
  return Object.hasOwn(UTILITY_COMPONENT_DEPENDENCIES, value);
}

function addAll<Value>(target: Set<Value>, values: Iterable<Value> | undefined) {
  for (const value of values ?? []) {
    target.add(value);
  }
}

function createProcessingError(file: string, action: string, error: unknown) {
  return new Error(`[quaff:css] Failed to ${action} for ${file}: ${getErrorMessage(error)}`, {
    cause: error,
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function normalizePath(path: string) {
  return path.replaceAll("\\", "/");
}

export async function fileExists(file: string) {
  try {
    await access(file);

    return true;
  } catch (error) {
    if (isMissingPathError(error)) {
      return false;
    }

    throw error;
  }
}

function isMissingPathError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
