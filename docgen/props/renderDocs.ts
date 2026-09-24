import { fileURLToPath } from "url";
import prettier from "prettier";
import { isPropsInterfaceName, type DocgenInterface } from "./types.js";

const PRETTIER_CONFIG_PATH = fileURLToPath(new URL("../../.prettierrc", import.meta.url));

export default async function renderDocs(interfaces: DocgenInterface[], hash?: string) {
  const options = await prettier.resolveConfig(PRETTIER_CONFIG_PATH);
  const declarations: string[] = [];

  for (const parsedInterface of interfaces.toSorted((a, b) => a.name.localeCompare(b.name))) {
    if (!isPropsInterfaceName(parsedInterface.name)) {
      throw new Error(`Cannot render invalid props interface name: ${parsedInterface.name}.`);
    }

    const name = parsedInterface.name.replace(/Props$/, "");
    const typeDependencies: [string, string][] = [];

    for (const [typeName, definition] of Object.entries(parsedInterface.typeDependencies)) {
      let formatted;

      try {
        formatted = (
          await prettier.format(definition, { ...options, parser: "typescript" })
        ).trim();
      } catch {
        formatted = definition;
      }

      typeDependencies.push([typeName, formatted]);
    }

    declarations.push(`export const ${name}Docs: QComponentDocs = {
      name: ${JSON.stringify(name)},
      ${parsedInterface.componentName && parsedInterface.componentName !== name ? `componentName: ${JSON.stringify(parsedInterface.componentName)},` : ""}
      description: ${JSON.stringify(parsedInterface.description ?? "")},
      docs: {
        generics: ${JSON.stringify(parsedInterface.generics)},
        domAttributesConstraint: ${JSON.stringify(parsedInterface.domAttributesConstraint)},
        props: ${JSON.stringify(parsedInterface.props)},
        snippets: ${JSON.stringify(parsedInterface.snippets)},
        methods: ${JSON.stringify(parsedInterface.methods)},
        typeDependencies: Object.fromEntries(${JSON.stringify(typeDependencies)}),
      },
    };`);
  }

  const source = [
    "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE",
    ...(hash ? [`// @quaffHash ${hash}`] : []),
    'import type { QComponentDocs } from "$docs";',
    declarations.join("\n\n"),
  ].join("\n\n");

  return prettier.format(source, { ...options, parser: "typescript" });
}
