import { readFile, readdir, realpath, stat } from "fs/promises";
import path from "path";
import { preprocess } from "svelte/compiler";
import { createSourceFile, isInterfaceDeclaration, preProcessFile, ScriptTarget } from "typescript";

export type ResolveDocgenImport = (source: string, importer: string) => Promise<string | undefined>;

export function isDocgenSourceFile(file: string) {
  return (
    !/^docs(?:\.(?:props|snippets))?\.ts$/.test(path.basename(file)) &&
    /\.(?:[cm]?[jt]s|svelte)$/.test(file)
  );
}

export async function getDocgenImports(source: string, file: string) {
  const scripts: string[] = [];

  if (file.endsWith(".svelte")) {
    await preprocess(source, {
      script: ({ content }) => {
        scripts.push(content);
      },
    });
  } else {
    scripts.push(source);
  }

  return scripts.flatMap((script) =>
    preProcessFile(script).importedFiles.map((entry) => entry.fileName)
  );
}

async function getComponentSources(source: string, file: string) {
  if (!/\.[cm]?ts$/.test(file)) {
    return [];
  }

  const parsed = createSourceFile(file, source, ScriptTarget.Latest);
  const components: string[] = [];

  for (const statement of parsed.statements) {
    if (!isInterfaceDeclaration(statement) || !statement.name.text.endsWith("Props")) {
      continue;
    }

    const componentName = statement.name.text.slice(0, -"Props".length);

    if (!componentName) {
      continue;
    }

    const component = path.join(path.dirname(file), `${componentName}.svelte`);

    try {
      if ((await stat(component)).isFile()) {
        components.push(await realpath(component));
      }
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !("code" in error) ||
        (error.code !== "ENOENT" && error.code !== "ENOTDIR")
      ) {
        throw error;
      }
    }
  }

  return components;
}

export function createDocgenSourceReader(resolveImport: ResolveDocgenImport) {
  const dependencies = new Map<string, Promise<string[]>>();

  function readDependencies(file: string) {
    let pending = dependencies.get(file);

    if (!pending) {
      pending = (async () => {
        const source = await readFile(file, "utf8");
        const resolved = await Promise.all(
          (await getDocgenImports(source, file))
            .filter((name) => name.startsWith(".") || name.startsWith("$") || path.isAbsolute(name))
            .map((name) => resolveImport(name, file))
        );

        const components = await getComponentSources(source, file);
        return [
          ...resolved.filter(
            (dependency): dependency is string => !!dependency && isDocgenSourceFile(dependency)
          ),
          ...components,
        ];
      })();
      dependencies.set(file, pending);
    }

    return pending;
  }

  return async function getSourceFiles(roots: string[], stopAt?: string): Promise<string[]> {
    const visited = new Set<string>();
    let hasReachedTarget = false;

    async function collect(file: string) {
      if (visited.has(file) || hasReachedTarget) {
        return;
      }

      visited.add(file);
      hasReachedTarget = file === stopAt;

      if (hasReachedTarget) {
        return;
      }

      for (const dependency of await readDependencies(file)) {
        await collect(dependency);
      }
    }

    for (const root of roots) {
      await collect(root);
    }

    return [...visited].sort();
  };
}

export async function getAffectedDocgenComponents(
  changedFile: string,
  componentsPath: string,
  resolveImport: ResolveDocgenImport
) {
  const getSourceFiles = createDocgenSourceReader(resolveImport);
  const affected: string[] = [];

  for (const component of await readdir(componentsPath, { withFileTypes: true })) {
    if (!component.isDirectory()) {
      continue;
    }

    const directory = path.join(componentsPath, component.name);
    const roots = (await readdir(directory))
      .filter((file) => file === "props.ts" || file.endsWith(".svelte"))
      .map((file) => path.join(directory, file));
    const sources = await getSourceFiles(roots, changedFile);

    if (sources.includes(changedFile)) {
      affected.push(directory);
    }
  }

  return affected;
}
