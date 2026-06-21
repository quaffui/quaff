import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  ComponentCss,
  ComponentCssDependencies,
  ComponentPathCssDependencies,
  type ComponentCssName,
} from "../internal/componentRegistry.js";
import type { Plugin, ResolvedConfig } from "vite";

type ComponentName = keyof typeof ComponentCssDependencies;
type ComponentPath = keyof typeof ComponentPathCssDependencies;

type QuaffCssOptions = {
  include?: readonly string[];
  exclude?: readonly string[];
  rootLayout?: string | false;
  sourceDir?: string;
};

const rootModule = "@quaffui/quaff";
const cssBase = `${rootModule}/css/base.css`;
const virtualCssId = "virtual:quaff/css";
const resolvedVirtualCssId = `\0${virtualCssId}`;
const sourceFile = /\.(svelte|[cm]?[jt]s|md|svx)$/;
const rootLayout = "src/routes/+layout.svelte";
const cssOrder = Object.values(ComponentCss);

export function quaffCss(options: QuaffCssOptions = {}): Plugin {
  let config: ResolvedConfig;

  return {
    name: "quaff:css",
    enforce: "pre",
    config: cssMinifierConfig,
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    resolveId(id) {
      if (id === virtualCssId) {
        return resolvedVirtualCssId;
      }
    },
    async load(id) {
      if (id !== resolvedVirtualCssId) {
        return;
      }

      return createCssModule(config.root, options);
    },
    transform(code, id) {
      if (!isRootLayout(id, config.root, options.rootLayout)) {
        return;
      }

      if (code.includes(virtualCssId) || code.includes(`${rootModule}/css/index.css`)) {
        return;
      }

      return {
        code: injectIntoSvelte(code, `import "${virtualCssId}";\n`),
        map: null,
      };
    },
    handleHotUpdate(ctx) {
      if (!sourceFile.test(ctx.file)) {
        return;
      }

      const virtualModule = ctx.server.moduleGraph.getModuleById(resolvedVirtualCssId);
      if (!virtualModule) {
        return;
      }

      ctx.server.moduleGraph.invalidateModule(virtualModule);
      return [...ctx.modules, virtualModule];
    },
  };
}

export function quaffCssMinifier(): Plugin {
  return {
    name: "quaff:css-minifier",
    config: cssMinifierConfig,
  };
}

const cssMinifierConfig: Plugin["config"] = {
  order: "post",
  handler: () => ({ build: { cssMinify: "esbuild" } }),
};

async function createCssModule(root: string, options: QuaffCssOptions) {
  const css = await collectUsedCss(root, options);

  if (css === "full" || !css.size) {
    return "export {};\n";
  }

  const imports = [
    cssBase,
    ...cssOrder.filter((name) => css.has(name)).map((name) => `${rootModule}/css/${name}.css`),
  ];

  return `${imports.map((path) => `import ${JSON.stringify(path)};`).join("\n")}\nexport {};\n`;
}

async function collectUsedCss(root: string, options: QuaffCssOptions) {
  const sourceRoot = resolve(root, options.sourceDir ?? "src");
  const files = await findSourceFiles(sourceRoot);
  const components = new Set(options.include ?? []);
  const css = new Set<ComponentCssName>();

  for (const file of files) {
    const code = await readFile(file, "utf8");

    if (code.includes(`${rootModule}/css/index.css`)) {
      return "full";
    }

    for (const component of findImportedComponents(code)) {
      components.add(component);
    }

    for (const component of findComponentTags(code)) {
      components.add(component);
    }

    for (const path of findDirectComponentPaths(code)) {
      if (isComponentPath(path)) {
        addCss(css, ComponentPathCssDependencies[path]);
      }
    }
  }

  for (const component of options.exclude ?? []) {
    components.delete(component);
  }

  for (const component of components) {
    if (isComponentName(component)) {
      addCss(css, ComponentCssDependencies[component]);
    }
  }

  return css;
}

async function findSourceFiles(dir: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const entry of entries) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (![".svelte-kit", "node_modules"].includes(entry.name)) {
        files.push(...(await findSourceFiles(path)));
      }
      continue;
    }

    if (sourceFile.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

function findImportedComponents(code: string) {
  const components: string[] = [];
  for (const names of code.matchAll(/import\s*{([^}]+)}\s*from\s*["']@quaffui\/quaff["']/g)) {
    for (const name of names[1].split(",")) {
      components.push(name.trim().split(/\s+as\s+/)[0]);
    }
  }

  return components;
}

function findComponentTags(code: string) {
  return [...code.matchAll(/<\s*(Q[A-Z][\w]*)\b/g)].map((match) => match[1]);
}

function findDirectComponentPaths(code: string) {
  return [
    ...code.matchAll(
      /import\s+(?!type\b)[^;]*from\s*["']@quaffui\/quaff\/components\/([^/"']+)\//g
    ),
  ].map((match) => match[1]);
}

function addCss(css: Set<ComponentCssName>, names: readonly ComponentCssName[] | undefined) {
  for (const name of names ?? []) {
    css.add(name);
  }
}

function isComponentName(value: string): value is ComponentName {
  return value in ComponentCssDependencies;
}

function isComponentPath(value: string): value is ComponentPath {
  return value in ComponentPathCssDependencies;
}

function isRootLayout(id: string, root: string, option: QuaffCssOptions["rootLayout"]) {
  if (option === false) {
    return false;
  }

  if (id.includes("?")) {
    return false;
  }

  return normalize(id) === normalize(resolve(root, option ?? rootLayout));
}

function injectIntoSvelte(code: string, imports: string) {
  const scriptStart = code.match(/<script(\s[^>]*)?>/);

  if (scriptStart?.index === undefined) {
    return `<script>\n${imports}</script>\n${code}`;
  }

  const insertAt = scriptStart.index + scriptStart[0].length;

  return `${code.slice(0, insertAt)}\n${imports}${code.slice(insertAt)}`;
}

function normalize(path: string) {
  return path.replaceAll("\\", "/");
}
