import { Node } from "ts-morph";
import { isImportedFromExternal } from "./checker";
import { type ParsedType, PRESERVE_TYPE_NAMES } from "./defs";
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
        const text = typeNode.getText();
        result[ref] = await parseType(text);

        typeNode.forEachDescendant((node) => {
          if (Node.isTypeReference(node)) {
            const subRef = node.getType().getText();
            if (!visited.has(subRef)) {
              Object.assign(result, computeAllReferences(subRef, contextNode, visited));
            }
          }
        });

        continue;
      }

      if (Node.isUnionTypeNode(typeNode)) {
        rawMembersText = typeNode.getTypeNodes().map((node) => node.getText());
      } else {
        rawMembersText = refType
          .getUnionTypes()
          .map((union) => extractTypeText(union, contextNode));
      }

      const unionMembers = await Promise.all(rawMembersText.map((text) => parseType(text)));
      result[ref] = unionMembers;

      for (const member of unionMembers) {
        const text = typeof member === "string" ? member : member.text;
        Object.assign(result, computeAllReferences(text, contextNode, visited));
      }
    } else {
      const refText = extractTypeText(refType, contextNode);
      result[ref] = await parseType(refText);
      Object.assign(result, computeAllReferences(refText, contextNode, visited));
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
  return Object.entries(computedTypes).toSorted(([typeNameA], [typeNameB, computedTypeB]) => {
    typeNameA = typeNameA.replace("Q.", "");
    typeNameB = typeNameB.replace("Q.", "");

    if (typeNameA === referenceType) {
      // We want the specific type to come last
      // so we can resolve nested types first
      return 1;
    } else if (typeNameB === referenceType) {
      // Idem here
      return -1;
    }

    if (Array.isArray(computedTypeB)) {
      const textsB = computedTypeB.map((t) => (typeof t === "string" ? t : t.text));

      // If the type is included in the other type, it should come first
      return textsB.some((textB) => textB.includes(typeNameA)) ? -1 : 1;
    } else {
      const textB = typeof computedTypeB === "string" ? computedTypeB : computedTypeB.text;

      // Idem here
      return textB.includes(typeNameA) ? -1 : 1;
    }
  });
}
