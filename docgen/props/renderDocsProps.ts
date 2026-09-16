import { fileURLToPath } from "url";
import prettier from "prettier";
import { isPropsInterfaceName, type DocgenInterface } from "./types.js";

const prettierConfigPath = fileURLToPath(new URL("../../.prettierrc", import.meta.url));

function exportName(interfaceName: string) {
  return interfaceName.replace(/Props$/, "Docs");
}

export default async function renderDocsProps(interfaces: DocgenInterface[], hash?: string) {
  for (const parsedInterface of interfaces) {
    if (!isPropsInterfaceName(parsedInterface.name)) {
      throw new Error(`Cannot render invalid props interface name: ${parsedInterface.name}.`);
    }
  }

  const options = await prettier.resolveConfig(prettierConfigPath);

  const declarations = await Promise.all(
    interfaces
      .toSorted((a, b) => a.name.localeCompare(b.name))
      .map(async (parsedInterface) => {
        const name = exportName(parsedInterface.name);
        const formattedTypeDependencies: [string, string][] = [];

        for (const [typeName, definition] of Object.entries(parsedInterface.typeDependencies)) {
          let formatted;

          try {
            formatted = (
              await prettier.format(definition, {
                ...options,
                parser: "typescript",
              })
            ).trim();
          } catch {
            formatted = definition;
          }

          formattedTypeDependencies.push([typeName, formatted]);
        }

        return [
          `export const ${name}DomAttributesConstraint: string | undefined = ${JSON.stringify(parsedInterface.domAttributesConstraint)};`,
          `export const ${name}Generics: QApiGeneric[] = ${JSON.stringify(parsedInterface.generics)};`,
          `export const ${name}Props: QApiEntry[] = ${JSON.stringify(parsedInterface.props)};`,
          `export const ${name}Snippets: QApiEntry[] = ${JSON.stringify(parsedInterface.snippets)};`,
          `export const ${name}Methods: QApiEntry[] = ${JSON.stringify(parsedInterface.methods)};`,
          `export const ${name}TypeDependencies: Record<string, string> = Object.fromEntries(${JSON.stringify(formattedTypeDependencies)});`,
        ].join("\n\n");
      })
  );

  const source = [
    "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE",
    ...(hash ? [`// @quaffHash ${hash}`] : []),
    'import type { QApiEntry, QApiGeneric } from "$docs";',
    "",
    declarations.join("\n\n"),
    "",
  ].join("\n");

  return prettier.format(source, { ...options, parser: "typescript" });
}
