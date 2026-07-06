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

/**
 * Simplifies occurrences of `Exclude<T, undefined>` inside type text to `T`.
 */
export function simplifyExcludeUndefined(text: string): string {
  let result = "";
  let i = 0;

  while (i < text.length) {
    const isWordStart = i === 0 || !/[a-zA-Z0-9_$]/.test(text[i - 1]);
    if (isWordStart && text.startsWith("Exclude<", i)) {
      let depth = 0;
      let commaIdx = -1;
      let endIdx = -1;
      const startIdx = i + "Exclude<".length;

      for (let j = startIdx; j < text.length; j++) {
        const char = text[j];
        if (char === "<") {
          depth++;
        } else if (char === ">") {
          if (depth === 0) {
            endIdx = j;
            break;
          }
          depth--;
        } else if (char === "," && depth === 0) {
          commaIdx = j;
        }
      }

      if (commaIdx !== -1 && endIdx !== -1) {
        // Exclude<T, U> where tVal is T and uVal is U
        const tVal = text.substring(startIdx, commaIdx).trim();
        const uVal = text.substring(commaIdx + 1, endIdx).trim();

        const simplifiedT = simplifyExcludeUndefined(tVal);
        const simplifiedU = simplifyExcludeUndefined(uVal);

        if (simplifiedU === "undefined") {
          result += simplifiedT;
        } else {
          result += `Exclude<${simplifiedT}, ${simplifiedU}>`;
        }
        i = endIdx + 1;
        continue;
      }
    }

    result += text[i];
    i++;
  }

  return result;
}
