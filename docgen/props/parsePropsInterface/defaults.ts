import { readFile } from "node:fs/promises";
import { parse } from "svelte/compiler";
import { ParsedDefaults } from "./defs";

export async function parseDefaults(svelteFile: string) {
  let content: string | undefined;
  const result: ParsedDefaults = new Map();

  try {
    content = await readFile(svelteFile, "utf-8");
  } catch (_err) {
    console.warn(`Skip parsing defaults for ${svelteFile}`);
    return result;
  }

  const ast = parse(content, { modern: true });

  const script = ast.instance;

  if (!script) {
    return result;
  }

  const { body } = script.content;

  for (const node of body) {
    if (node.type !== "VariableDeclaration" || node.declarations.length !== 1) {
      continue;
    }

    const [{ id, init }] = node.declarations;

    if (
      init?.type !== "CallExpression" ||
      init.callee.type !== "Identifier" ||
      init.callee.name !== "$props" ||
      id.type !== "ObjectPattern"
    ) {
      continue;
    }

    for (const prop of id.properties) {
      if (prop.type !== "Property") {
        continue;
      }

      const { key, value } = prop;

      if (key.type !== "Identifier") {
        continue;
      }

      const { name } = key;

      if (value.type === "Identifier" && value.name === name) {
        // Case: const { name } = $props(); => The prop has no default
        result.set(name, {});
      }

      if (value.type === "AssignmentPattern") {
        // Case: const { name = ... } = $props(); => The prop has a default value
        const { right } = value;

        if (right.type === "Literal") {
          // Case: const { name = "default" } = $props();
          result.set(name, { default: right.raw });
        } else if (
          right.type === "CallExpression" &&
          right.callee.type === "Identifier" &&
          right.callee.name === "$bindable"
        ) {
          // Case: const { name = $bindable(...) } = $props();
          const [arg] = right.arguments;

          // @ts-expect-error Svelte parser doesn't add start/end to types for some reason
          const txt = arg ? content.slice(arg.start, arg.end) || "unknown" : "undefined";

          result.set(name, { bindable: true, default: txt });
        } else {
          // Case: const { name = ... } = $props(); where ... is neither a Literal nor a "$bindable" CallExpression

          // @ts-expect-error Svelte parser doesn't add start/end to types for some reason
          const txt = content.slice(right.start, right.end) || "unknown";

          result.set(name, { default: txt });
        }
      }
    }
  }

  return result;
}
