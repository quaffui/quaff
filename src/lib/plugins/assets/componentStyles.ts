import {
  CSS_BY_CLASS,
  COMPONENT_METADATA,
  COMPONENT_NAMES_BY_IMPORT_PATH,
  UTILITY_COMPONENT_DEPENDENCIES,
  type ComponentCssName,
  type ComponentName,
} from "../../internal/componentRegistry.js";
import type { SourceUsage } from "./analyzeSource.js";
import type {
  QuaffAssetsOptions,
  QuaffCssComplexSafelist,
  QuaffCssSafelist,
} from "./assetOptions.js";

type UtilityName = Extract<keyof typeof UTILITY_COMPONENT_DEPENDENCIES, string>;

export interface CssSelection {
  keep: Set<string>;
  candidates: Set<string>;
  css: Set<ComponentCssName>;
  components: Set<ComponentName>;
}

export function createCssSelection(
  sources: Iterable<SourceUsage>,
  options: QuaffAssetsOptions,
  safelisted: CssSelection
): CssSelection {
  const selection: CssSelection = {
    keep: new Set(safelisted.keep),
    candidates: new Set(safelisted.candidates),
    css: new Set(safelisted.css),
    components: new Set(),
  };
  const requestedComponents = new Set(options.include ?? []);

  for (const source of sources) {
    addSourceComponents(selection, requestedComponents, source);
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
    addRequestedComponentStyles(selection, requested);
  }

  return selection;
}

function addSourceComponents(selection: CssSelection, requested: Set<string>, source: SourceUsage) {
  addAll(selection.candidates, source.candidates);

  for (const importPath of source.componentPaths) {
    addAll(requested, getImportedComponents(importPath));
  }
}

function addRequestedComponentStyles(selection: CssSelection, requested: string) {
  const components = isUtilityName(requested)
    ? UTILITY_COMPONENT_DEPENDENCIES[requested]
    : [requested];

  for (const component of components) {
    if (isComponentName(component)) {
      addComponent(selection, component);
    }
  }
}

function getImportedComponents(importPath: string) {
  // Package exports can redirect an older folder to the same component.
  const component = importPath
    .split("/")
    .at(-1)
    ?.replace(/\.svelte$/, "");

  if (component && isComponentName(component)) {
    return [component];
  }

  const directory = `${importPath.split("/", 1)[0]}/`;
  const components: ComponentName[] = [];

  for (const [path, name] of Object.entries(COMPONENT_NAMES_BY_IMPORT_PATH)) {
    if (path.startsWith(directory)) {
      components.push(name);
    }
  }

  return components;
}

function addComponent(selection: CssSelection, component: ComponentName) {
  const metadata = COMPONENT_METADATA[component];

  selection.components.add(component);

  addAll(selection.keep, metadata.keep);
  addAll(selection.css, metadata.css);
}

export interface NormalizedSafelist {
  deep: RegExp[];
  greedy: RegExp[];
  standard: (RegExp | string)[];
}

export function normalizeSafelist(safelist: QuaffCssSafelist | undefined): NormalizedSafelist {
  const configured = Array.isArray(safelist) ? { standard: safelist } : (safelist ?? {});
  const { deep = [], greedy = [], standard = [] } = configured as QuaffCssComplexSafelist;

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

export function createClassPattern(className: string) {
  return new RegExp(`^${className}(?:$|--|__)`);
}

export function addCandidateComponentCss(selection: CssSelection) {
  for (const candidate of selection.candidates) {
    const baseClass = getBaseClass(candidate);

    if (!baseClass || !Object.hasOwn(CSS_BY_CLASS, baseClass)) {
      continue;
    }

    selection.keep.add(baseClass);
    addAll(selection.css, CSS_BY_CLASS[baseClass]);
  }
}

export function getBaseClass(candidate: string) {
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
