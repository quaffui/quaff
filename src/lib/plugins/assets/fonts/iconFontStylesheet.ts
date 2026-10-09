import { readdir, readFile } from "node:fs/promises";
import {
  COMPONENT_DEFINITIONS,
  COMPONENT_PARENT_FOLDER,
} from "../../../internal/componentRegistry.js";
import { analyzeSource, type SourceUsage } from "../analyzeSource.js";
import { getOrCreateCachedValue } from "../promiseCache.js";
import { getFontDisplay, selectFontValues } from "./fontOptions.js";
import type { FontAssetStore } from "./fontAssetStore.js";
import type { QuaffIconFontOptions } from "../assetOptions.js";
import type { ComponentName } from "../../../internal/componentRegistry.js";

const STYLE_LABELS = { outlined: "Outlined", rounded: "Rounded", sharp: "Sharp" } as const;
const STYLES = ["outlined", "rounded", "sharp"] as const;
const DECODER = new TextDecoder();
const MAX_STYLESHEET_SELECTIONS = 16;

export interface FontSourceUsage {
  sources: readonly SourceUsage[];
  components: ReadonlySet<ComponentName>;
}

export class IconFontStylesheet {
  private readonly styles;
  private readonly display;
  private availableNames: Promise<Set<string>> | undefined;
  private readonly selections = new WeakMap<FontSourceUsage, Promise<Set<string>>>();
  private readonly stylesheets = new Map<string, Promise<string>>();

  constructor(
    private readonly assets: FontAssetStore,
    private readonly options: QuaffIconFontOptions
  ) {
    this.styles = selectFontValues(options.styles, STYLES, STYLES, "Material Symbols styles");
    this.display = getFontDisplay(options.display, "block");
  }

  async getStylesheet(usage?: FontSourceUsage) {
    const names = this.options.stripUnused ? await this.getSelection(usage) : undefined;
    const key = names ? [...names].join("\n") : "full";
    const stylesheet = this.stylesheets.get(key) ?? this.createStylesheet(names);

    // Keep recent selections for edits and undo without retaining every development revision.
    this.stylesheets.delete(key);
    this.stylesheets.set(key, stylesheet);

    if (this.stylesheets.size > MAX_STYLESHEET_SELECTIONS) {
      this.stylesheets.delete(this.stylesheets.keys().next().value!);
    }

    try {
      return await stylesheet;
    } catch (error) {
      if (this.stylesheets.get(key) === stylesheet) {
        this.stylesheets.delete(key);
      }

      throw error;
    }
  }

  private getSelection(usage: FontSourceUsage | undefined): Promise<Set<string>> {
    if (!usage) {
      throw new Error(
        "[quaff:assets] Icon usage is required when fonts.icons.stripUnused is enabled."
      );
    }

    return getOrCreateCachedValue(this.selections, usage, async () => {
      const availableNames = await this.getAvailableNames();

      return collectIconNames(
        usage.sources,
        availableNames,
        this.options.safelist ?? [],
        usage.components
      );
    });
  }

  private async createStylesheet(names: Set<string> | undefined) {
    if (names?.size === 0) {
      return "";
    }

    const declarations: string[] = [];
    const selectedNames = names ? [...names] : undefined;

    for (const style of this.styles) {
      const name = `material-symbols-${style}.woff2`;
      const original = await this.assets.readAsset(`material-symbols/${name}`);
      let bytes = original;

      if (selectedNames) {
        bytes = await this.assets.getOrCreateSubset(original, selectedNames, async () => {
          const { subsetIconFont } = await import("./subsetIconFont.js");

          return subsetIconFont(original, selectedNames);
        });
      }

      const url = await this.assets.writeAsset(name, bytes);

      declarations.push(
        `@font-face{font-family:"Material Symbols ${STYLE_LABELS[style]}";src:url("${url}") format("woff2");font-style:normal;font-weight:100 700;font-display:${this.display};}`
      );
    }

    return declarations.join("\n");
  }

  private async readAvailableNames() {
    const declarations = DECODER.decode(await this.assets.readAsset("material-symbols/index.d.ts"));
    const tuple = declarations.match(/type MaterialSymbols\s*=\s*\[([\s\S]*?)\];/);

    if (!tuple) {
      throw new Error("[quaff:fonts] Could not read Material Symbols icon names.");
    }

    return new Set([...tuple[1].matchAll(/"([a-z0-9_]+)"/g)].map((match) => match[1]));
  }

  private async getAvailableNames() {
    try {
      this.availableNames ??= this.readAvailableNames();

      return await this.availableNames;
    } catch (error) {
      this.availableNames = undefined;

      throw error;
    }
  }
}

const COMPONENT_SOURCE_PATTERN = /\.(?:svelte|[cm]?[jt]s)$/;
const EXCLUDED_SOURCE_PATTERN = /(?:\.d\.[cm]?[jt]s|\.(?:test|spec)\.[cm]?[jt]s|\/docs\.[jt]s)$/;
const componentSourceCache = new Map<string, Promise<SourceUsage[]>>();

export async function collectIconNames(
  sources: Iterable<SourceUsage>,
  availableNames: ReadonlySet<string>,
  safelist: readonly string[],
  componentNames: ReadonlySet<ComponentName>
): Promise<Set<string>> {
  const usages = [...sources];
  const names = new Set<string>();

  for (const name of safelist) {
    if (!availableNames.has(name)) {
      throw new Error(`[quaff:fonts] Unknown Material Symbols icon in safelist: ${name}`);
    }

    names.add(name);
  }

  const directories = new Set(
    [...collectComponentDependencies(componentNames)].map((name) => COMPONENT_PARENT_FOLDER[name])
  );

  for (const directory of directories) {
    const componentSources = await getOrCreateCachedValue(
      componentSourceCache,
      directory,
      async () => readComponentSources(directory)
    );
    usages.push(...componentSources);
  }

  for (const usage of usages) {
    addMatchingCandidates(usage, availableNames, names);
  }

  return new Set([...names].sort());
}

function collectComponentDependencies(components: ReadonlySet<ComponentName>) {
  const dependencies = new Set(components);

  for (const name of dependencies) {
    addComponentChildren(name, dependencies);
  }

  return dependencies;
}

function addMatchingCandidates(
  usage: SourceUsage,
  availableNames: ReadonlySet<string>,
  names: Set<string>
) {
  for (const candidate of usage.candidates) {
    if (availableNames.has(candidate)) {
      names.add(candidate);
    }
  }
}

function addComponentChildren(name: ComponentName, dependencies: Set<ComponentName>) {
  for (const child of COMPONENT_DEFINITIONS[name].uses ?? []) {
    if (isComponentName(child)) {
      dependencies.add(child);
    }
  }
}

function isComponentName(name: string): name is ComponentName {
  return Object.hasOwn(COMPONENT_DEFINITIONS, name);
}

async function readComponentSources(directory: string): Promise<SourceUsage[]> {
  const root = new URL(`../../../${directory}/`, import.meta.url);
  const sources: SourceUsage[] = [];

  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (
      !entry.isFile() ||
      !COMPONENT_SOURCE_PATTERN.test(entry.name) ||
      EXCLUDED_SOURCE_PATTERN.test(`/${entry.name}`)
    ) {
      continue;
    }

    const sourceFile = new URL(entry.name, root);
    const code = await readFile(sourceFile, "utf8");
    sources.push(await analyzeSource(code, false, true));
  }

  return sources;
}
