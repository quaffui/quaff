import { Node, SyntaxKind } from "ts-morph";
import { isImportedFromExternal } from "./checker";
import { BUILTIN_TYPES, MaybeParsed, type ParsedType, PRESERVE_TYPE_NAMES } from "./defs";
import { extractInternalTypeReferenceSymbol, extractTypeText } from "./extractor";
import { parseType } from "./parser";

/**
 * Attempts to preserve the raw type annotation as-is when it references
 * a preserved or external type. This catches cases where the alias info
 * is lost during type resolution (e.g. `MaterialSymbol` or `HTMLAnchorAttributes["target"]`).
 *
 * Returns the preserved result or `undefined` if the annotation should be resolved normally.
 */
export async function tryPreserveAnnotation(rawAnnotation: string, contextNode: Node) {
  // Don't try to preserve if the annotation itself contains a top-level union
  if (splitUnionParts(rawAnnotation).length > 1) {
    return undefined;
  }

  // Preserve inline template literals
  if (rawAnnotation.includes("`")) {
    const computedTypes = await computeAllReferences(rawAnnotation, contextNode);

    return parseType(rawAnnotation, computedTypes);
  }

  // Extract the base type name (first identifier before `[`, `<`, or end)
  const baseTypeMatch = rawAnnotation.match(/^(\w+)/);
  if (!baseTypeMatch) {
    return;
  }

  const baseTypeName = baseTypeMatch[1];

  // Check if the base is a directly preserved type name (e.g. "MaterialSymbol")
  if (PRESERVE_TYPE_NAMES.has(baseTypeName)) {
    return parseType(rawAnnotation);
  }

  // Check if the base type is imported from an external package
  // (e.g. HTMLAnchorAttributes["target"], MouseEventHandler<HTMLElement>)
  if (isImportedFromExternal(baseTypeName, contextNode)) {
    return parseType(rawAnnotation);
  }

  // Otherwise, fall through to normal resolution
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
 * Scans a type text for capitalized identifiers and attempts to resolve them
 * as internal type aliases or interfaces, returning a flattened map of all
 * referenced computed types.
 */
export async function computeAllReferences(
  text: string,
  contextNode: Node,
  visited = new Set<string>()
) {
  const result: NonNullable<ParsedType["computedTypes"]> = {};
  const references = Array.from(new Set(text.match(/\b([A-Z]\w*(?:\.\w+)*)\b/g) || []));

  for (const ref of references) {
    if (
      visited.has(ref) ||
      PRESERVE_TYPE_NAMES.has(ref) ||
      BUILTIN_TYPES.has(ref) ||
      isImportedFromExternal(ref, contextNode)
    ) {
      continue;
    }

    const refSymbol = extractInternalTypeReferenceSymbol(ref, contextNode);
    if (!refSymbol) {
      continue;
    }

    const decls = refSymbol.getDeclarations();
    if (!decls.length) {
      continue;
    }

    const decl = decls[0];

    const typeChecker = contextNode.getProject().getTypeChecker();
    const refType = refSymbol.getDeclaredType() ?? typeChecker.getTypeAtLocation(decl);

    visited.add(ref);

    if (refType.isUnion()) {
      let rawMembersText;
      let typeNode;

      if (Node.isTypeAliasDeclaration(decl) || Node.isPropertySignature(decl)) {
        typeNode = decl.getTypeNode();
      }

      if (Node.isTemplateLiteralTypeNode(typeNode)) {
        const text = typeNode.getText({ includeJsDocComments: false });
        result[ref] = await parseType(text);

        const subRefs: string[] = [];
        typeNode.forEachDescendant((node) => {
          if (Node.isTypeReference(node)) {
            subRefs.push(node.getText({ includeJsDocComments: false }));
          }
        });

        for (const subRef of subRefs) {
          if (!visited.has(subRef)) {
            Object.assign(result, await computeAllReferences(subRef, decl, visited));
          }
        }

        continue;
      }

      if (Node.isUnionTypeNode(typeNode)) {
        rawMembersText = typeNode
          .getTypeNodes()
          .map((node) => node.getText({ includeJsDocComments: false }));
      } else {
        rawMembersText = refType
          .getUnionTypes()
          .map((union) => extractTypeText(union, contextNode));
      }

      const unionMembers = await Promise.all(rawMembersText.map((text) => parseType(text)));
      result[ref] = unionMembers;

      for (const member of unionMembers) {
        const text = getText(member);
        Object.assign(result, await computeAllReferences(text, decl, visited));
      }
    } else if (
      Node.isInterfaceDeclaration(decl) ||
      Node.isTypeAliasDeclaration(decl) ||
      Node.isEnumDeclaration(decl) ||
      Node.isClassDeclaration(decl)
    ) {
      const name = decl.getName() ?? ref;

      removeChildrenComments(decl);

      const parsed: ParsedType = {
        text: name,
        typeDefinition: decl.getText({ includeJsDocComments: false }).replaceAll("\n\n", "\n"),
      };
      result[ref] = parsed;
      Object.assign(
        result,
        await computeAllReferences(decl.getText({ includeJsDocComments: false }), decl, visited)
      );
    } else {
      const refText = extractTypeText(refType, contextNode);
      result[ref] = await parseType(refText);
      Object.assign(result, await computeAllReferences(refText, decl, visited));
    }
  }

  return result;
}

/**
 * Sorts the computed types by reference:
 * - The reference type comes last
 * - Types which don't reference other types come first
 */
export function sortComputedTypes(
  computedTypes: NonNullable<ParsedType["computedTypes"]>,
  referenceType: string
) {
  const sorted: [string, MaybeParsed | MaybeParsed[]][] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const isReferenceType = (key: string) => {
    return key === referenceType || key.replace(/^Q\./, "") === referenceType;
  };

  const references = (value: MaybeParsed | MaybeParsed[], targetKey: string) => {
    const texts = Array.isArray(value) ? value.map(getText) : [getText(value)];
    const escaped = targetKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`);
    return texts.some((text) => regex.test(text));
  };

  const visit = (key: string) => {
    if (visited.has(key)) {
      return;
    }
    if (visiting.has(key)) {
      // Cycle detected, break recursion
      return;
    }

    visiting.add(key);

    const value = computedTypes[key];
    for (const otherKey of Object.keys(computedTypes)) {
      if (otherKey === key || isReferenceType(otherKey)) {
        continue;
      }

      if (references(value, otherKey)) {
        visit(otherKey);
      }
    }

    visiting.delete(key);
    visited.add(key);
    sorted.push([key, value]);
  };

  // 1. Visit all non-reference types first (standalone and their dependencies)
  for (const key of Object.keys(computedTypes)) {
    if (!isReferenceType(key)) {
      visit(key);
    }
  }

  // 2. Finally, visit the reference type itself
  for (const key of Object.keys(computedTypes)) {
    if (isReferenceType(key)) {
      visit(key);
    }
  }

  return sorted;
}

/**
 * Gets the text from a parsed type or a string.
 */
export function getText(type: MaybeParsed) {
  return typeof type === "string"
    ? type
    : type.text.endsWith("Props")
      ? type.typeDefinition || type.text
      : type.text;
}

function removeChildrenComments(node: Node) {
  node.forEachChild((child) => {
    const comments = child.getChildrenOfKind(SyntaxKind.JSDoc);

    if (comments.length) {
      comments.forEach((comment) => comment.remove());
    }
  });
}
