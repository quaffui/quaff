import { Node } from "ts-morph";
import { isImportedFromExternal } from "./checker";
import { type ParsedType, PRESERVE_TYPE_NAMES } from "./defs";
import { parseType } from "./parser";

/**
 * Attempts to preserve the raw type annotation as-is when it references
 * a preserved or external type.
 */
export async function tryPreserveAnnotation(
  rawAnnotation: string,
  contextNode: Node,
  typeDependencies: Record<string, ParsedType | ParsedType[]>
) {
  // Don't try to preserve if the annotation itself contains a top-level union
  if (splitUnionParts(rawAnnotation).length > 1) {
    return undefined;
  }

  // Preserve inline template literals
  if (rawAnnotation.includes("`")) {
    return parseType(rawAnnotation, typeDependencies, contextNode);
  }

  // Extract the base type name
  const baseTypeMatch = rawAnnotation.match(/^(\w+)/);
  if (!baseTypeMatch) {
    return;
  }

  const baseTypeName = baseTypeMatch[1];

  // Check if the base is a directly preserved type name (e.g. "MaterialSymbol")
  if (PRESERVE_TYPE_NAMES.has(baseTypeName)) {
    return parseType(rawAnnotation, typeDependencies, contextNode);
  }

  // Check if the base type is imported from an external package
  if (isImportedFromExternal(baseTypeName, contextNode)) {
    return parseType(rawAnnotation, typeDependencies, contextNode);
  }

  return;
}

/**
 * Splits a union type string by `|`, respecting nesting in `<>`, `{}`, `()`, and backticks.
 */
export function splitUnionParts(text: string) {
  const parts: string[] = [];

  let current = "";
  let depth = 0;
  let inBacktick = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === "`") {
      inBacktick = !inBacktick;
      current += char;
      continue;
    }

    if (inBacktick) {
      current += char;
      continue;
    }

    if (["<", "(", "{", "["].includes(char)) {
      depth++;
      current += char;
    } else if ([">", ")", "}", "]"].includes(char)) {
      depth--;
      current += char;
    } else if (char === "|" && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  current = current.trim();

  if (current) {
    parts.push(current);
  }

  return parts;
}

/**
 * Gets the text from a parsed type or a string.
 */
export function getText(type: ParsedType) {
  if (typeof type === "string") {
    return type;
  }
  if ("name" in type) {
    return type.name;
  }
  return type.definition;
}

export function removeChildrenComments(node: Node) {
  if (Node.isJSDocable(node)) {
    node.getJsDocs().forEach((comment) => comment.remove());
  }
  node.forEachDescendant((descendant) => {
    if (Node.isJSDocable(descendant)) {
      descendant.getJsDocs().forEach((comment) => comment.remove());
    }
  });
}
