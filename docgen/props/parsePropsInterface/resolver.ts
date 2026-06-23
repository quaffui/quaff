import { type Symbol as MorphSymbol, Node, type Type, TypeFormatFlags } from "ts-morph";
import { isTypeAlias, isTypeOriginatingFrom } from "./checker";
import {
  LARGE_UNION_THRESHOLD,
  MaybeParsed,
  ParsedPropertyFlags,
  PRESERVE_TYPE_NAMES,
  TypeSrcMap,
} from "./defs";
import { extractRawTypeAnnotation, extractTypeText } from "./extractor";
import { parseType } from "./parser";
import { computeAllReferences, splitUnionParts, tryPreserveAnnotation } from "./utils";

/**
 * Core type resolution logic. Determines how to represent a property's type
 * based on the rules:
 * - Preserve external types (MaterialSymbol, Snippet, etc.) as-is
 * - Resolve internal type aliases (like QBtnVariantOptions) to their values
 * - Show computed types for Omit/Exclude
 * - Preserve template literal syntax
 * - Show generic parameter names as-is
 * - For large unions (>10 members), show the alias name
 */
export async function resolvePropertyType(
  prop: MorphSymbol,
  decl: Node | undefined,
  contextNode: Node,
  genericNames: Set<string>
) {
  const propType = prop.getTypeAtLocation(contextNode);
  const nonNullType = propType.getNonNullableType();
  const rawAnnotation = extractRawTypeAnnotation(decl);

  if (nonNullType.isArray()) {
    const elementType = nonNullType.getArrayElementTypeOrThrow();

    let elementRawAnnotation: string | undefined;
    if (rawAnnotation) {
      const arrayMatch = rawAnnotation.match(/^(.*)\[\]$/);

      if (arrayMatch) {
        elementRawAnnotation = arrayMatch[1].trim().replace(/^\((.*)\)$/, "$1");
      } else {
        const genericMatch = rawAnnotation.match(/^Array<(.*)>$/);

        if (genericMatch) {
          elementRawAnnotation = genericMatch[1].trim();
        }
      }
    }

    if (elementRawAnnotation) {
      const preserved = await tryPreserveAnnotation(elementRawAnnotation, contextNode);

      if (preserved) {
        return {
          type: preserved,
          flags: ParsedPropertyFlags.ARRAY,
        };
      }
    }

    const elementAliasSymbol = elementType.getAliasSymbol();
    if (elementAliasSymbol) {
      const res = await resolveAliasedType(
        elementType,
        elementAliasSymbol,
        contextNode,
        elementRawAnnotation
      );
      return {
        type: res,
        flags: ParsedPropertyFlags.ARRAY,
      };
    }

    if (elementType.isUnion()) {
      const res = await resolveUnionType(
        elementType,
        contextNode,
        genericNames,
        elementRawAnnotation
      );
      return {
        type: res,
        flags: ParsedPropertyFlags.ARRAY,
      };
    }

    const elementText = extractTypeText(elementType, contextNode);
    return {
      type: await parseType(elementRawAnnotation ?? elementText),
      flags: ParsedPropertyFlags.ARRAY,
    };
  }

  // Check if the raw annotation is a Snippet type
  if (rawAnnotation && rawAnnotation.startsWith("Snippet")) {
    const params = resolveSnippetParams(rawAnnotation);
    return {
      type: await parseType(params ?? "void"),
      flags: ParsedPropertyFlags.SNIPPET,
    };
  }

  // Check if it's a Snippet from a resolved type (e.g. when inherited)
  const aliasSymbol = propType.getAliasSymbol();
  const resolvedText = extractTypeText(nonNullType, contextNode);

  if (aliasSymbol?.getName() === "Snippet" || resolvedText.startsWith("Snippet")) {
    const fullText = aliasSymbol
      ? nonNullType.getText(contextNode, TypeFormatFlags.NoTruncation)
      : resolvedText;
    const params = resolveSnippetParams(fullText);

    return {
      type: await parseType(params ?? "void"),
      flags: ParsedPropertyFlags.SNIPPET,
    };
  }

  // Check if the raw annotation references a preserved or external type
  // (catches cases where alias info is lost during resolution, e.g. MaterialSymbol
  // resolving to a 1000+ member union, or HTMLAnchorAttributes["target"] resolving
  // to "_self" | "_blank" | "_parent" | "_top" | (string & {}))
  if (rawAnnotation) {
    const preserved = await tryPreserveAnnotation(rawAnnotation, contextNode);
    if (preserved) {
      return {
        type: preserved,
        flags: ParsedPropertyFlags.NONE,
      };
    }
  }

  // Handle boolean types (Typescript resolves `boolean` as a `true` | `false` union)
  if (
    nonNullType.isBoolean() ||
    nonNullType.isBooleanLiteral() ||
    (nonNullType.isUnion() &&
      nonNullType.getUnionTypes().every((union) => union.isBooleanLiteral()))
  ) {
    return {
      type: "boolean",
      flags: ParsedPropertyFlags.NONE,
    };
  }

  // Handle union types
  if (nonNullType.isUnion()) {
    return {
      type: await resolveUnionType(nonNullType, contextNode, genericNames, rawAnnotation),
      flags: ParsedPropertyFlags.NONE,
    };
  }

  // Handle `keyof X` types and types that use a generic parameter
  if (rawAnnotation && (rawAnnotation.startsWith("keyof ") || genericNames.has(rawAnnotation))) {
    return {
      type: await parseType(rawAnnotation),
      flags: ParsedPropertyFlags.NONE,
    };
  }

  // Handle aliased types
  if (aliasSymbol) {
    return {
      type: await resolveAliasedType(nonNullType, aliasSymbol, contextNode, rawAnnotation),
      flags: ParsedPropertyFlags.NONE,
    };
  }

  // Default: use the resolved type text
  return {
    type: await parseType(resolvedText),
    flags: ParsedPropertyFlags.NONE,
  };
}

/**
 * Resolves a type that has an alias symbol. Determines whether to show
 * the alias name or its computed value based on external/internal status.
 */
async function resolveAliasedType(
  type: Type,
  aliasSymbol: MorphSymbol,
  contextNode: Node,
  rawAnnotation: string | undefined
) {
  const aliasName = aliasSymbol.getName();

  // Preserve well-known external types
  if (PRESERVE_TYPE_NAMES.has(aliasName)) {
    return parseType(aliasName);
  }

  // External types: keep as-is
  if (isTypeOriginatingFrom(type, "external")) {
    const fullText = type.getText(contextNode, TypeFormatFlags.NoTruncation);
    return parseType(fullText);
  }

  // Internal alias: resolve to the computed value
  const resolvedText = extractTypeText(type, contextNode);
  const computedTypes = {
    [aliasName]: await parseType(resolvedText),
    ...(await computeAllReferences(resolvedText, contextNode, new Set([aliasName]))),
  };
  return parseType(rawAnnotation ?? aliasName, computedTypes);
}

/**
 * Resolves a union type into either a single `ParsedType` (if the alias should be preserved)
 * or an array of `ParsedType` (for each union member).
 */
async function resolveUnionType(
  type: Type,
  contextNode: Node,
  genericNames: Set<string>,
  rawAnnotation: string | undefined
) {
  const unionTypes = type.getUnionTypes();

  // If the union is from a type alias, check if we should preserve the alias name
  const aliasSymbol = type.getAliasSymbol();

  if (!aliasSymbol && rawAnnotation && isTypeAlias(rawAnnotation, contextNode)) {
    const resolved = await resolveTypeAliasMembers(rawAnnotation, contextNode);
    if (resolved) {
      return resolved;
    }
  }

  if (aliasSymbol) {
    const aliasName = aliasSymbol.getName();

    // Preserve external types like MaterialSymbol or Snippet
    if (PRESERVE_TYPE_NAMES.has(aliasName)) {
      return parseType(aliasName);
    }

    // Internal type alias: resolve to computed values using AST nodes to preserve references
    if (isTypeOriginatingFrom(type, "internal")) {
      let rawMembersText: string[];
      let typeNode;

      const declarations = aliasSymbol.getDeclarations();

      if (declarations.length) {
        const decl = declarations[0];

        if (Node.isTypeAliasDeclaration(decl) || Node.isPropertySignature(decl)) {
          typeNode = decl.getTypeNode();
        }
      }

      if (Node.isTemplateLiteralTypeNode(typeNode)) {
        const resolvedText = typeNode.getText();
        const computedTypes = {
          [aliasName]: await parseType(resolvedText),
        };

        typeNode.forEachDescendant(async (node) => {
          if (Node.isTypeReference(node)) {
            const subRef = node.getText();
            Object.assign(
              computedTypes,
              computeAllReferences(subRef, contextNode, new Set([aliasName]))
            );
          }
        });

        return parseType(aliasName, computedTypes);
      }

      if (Node.isUnionTypeNode(typeNode)) {
        rawMembersText = typeNode.getTypeNodes().map((node) => node.getText());
      } else {
        rawMembersText = unionTypes.map((unionType) => extractTypeText(unionType, contextNode));
      }

      const unionMembers = await Promise.all(rawMembersText.map((text) => parseType(text)));
      const computedTypes = {
        [aliasName]: unionMembers,
      };

      const visited = new Set([aliasName]);

      for (const member of unionMembers) {
        const text = typeof member === "string" ? member : member.text;
        Object.assign(computedTypes, await computeAllReferences(text, contextNode, visited));
      }

      return parseType(aliasName, computedTypes);
    }

    // Large unions (external): show the alias name
    if (unionTypes.length > LARGE_UNION_THRESHOLD) {
      return parseType(aliasName, {
        [aliasName]: await Promise.all(
          unionTypes.map((union) => parseType(extractTypeText(union, contextNode)))
        ),
      });
    }
  }

  // If the raw annotation contains a union with diverse types (e.g. MaterialSymbol | `img:${string}`)
  // parse each member individually
  if (rawAnnotation?.includes("|")) {
    return resolveRawUnionAnnotation(rawAnnotation, contextNode, genericNames);
  }

  // Simple union: map each member
  if (unionTypes.length <= LARGE_UNION_THRESHOLD) {
    return Promise.all(unionTypes.map((union) => parseType(extractTypeText(union, contextNode))));
  }

  // Fallback for large unions without alias
  return parseType(extractTypeText(type, contextNode));
}

/**
 * Resolves a type alias name to its union members as `ParsedType[]`.
 * Returns `undefined` if the alias doesn't resolve to a union.
 */
export async function resolveTypeAliasMembers(typeName: string, contextNode: Node) {
  const sourceFile = contextNode.getSourceFile();
  const localAlias = sourceFile.getTypeAlias(typeName);

  if (localAlias) {
    const aliasType = localAlias.getType();
    if (aliasType.isUnion()) {
      const typeNode = localAlias.getTypeNode();

      if (Node.isTemplateLiteralTypeNode(typeNode)) {
        const resolvedText = typeNode.getText();
        const computedTypes = {
          [typeName]: await parseType(resolvedText),
        };

        typeNode.forEachDescendant((node) => {
          if (Node.isTypeReference(node)) {
            const subRef = node.getType().getText();
            Object.assign(
              computedTypes,
              computeAllReferences(subRef, contextNode, new Set([typeName]))
            );
          }
        });

        return parseType(typeName, computedTypes);
      }

      let rawMembersText: string[];
      if (Node.isUnionTypeNode(typeNode)) {
        rawMembersText = typeNode.getTypeNodes().map((node) => node.getText());
      } else {
        rawMembersText = aliasType
          .getUnionTypes()
          .map((union) => extractTypeText(union, contextNode));
      }

      const unionMembers = await Promise.all(rawMembersText.map((text) => parseType(text)));
      const computedTypes = {
        [typeName]: unionMembers,
      };

      const visited = new Set([typeName]);
      for (const member of unionMembers) {
        const text = typeof member === "string" ? member : member.text;
        Object.assign(computedTypes, computeAllReferences(text, contextNode, visited));
      }

      return parseType(typeName, computedTypes);
    }

    // Not a union, return the resolved text
    const resolvedText = extractTypeText(aliasType, contextNode);
    const computedTypes = {
      [typeName]: await parseType(resolvedText),
      ...(await computeAllReferences(resolvedText, contextNode, new Set([typeName]))),
    };

    return parseType(resolvedText, computedTypes);
  }
}

/**
 * Parses a raw union annotation like `MaterialSymbol | \`img:${string}\``
 * into individual ParsedType entries, preserving external type names.
 */
async function resolveRawUnionAnnotation(
  rawAnnotation: string,
  contextNode: Node,
  genericNames: Set<string>
) {
  const parts = splitUnionParts(rawAnnotation);

  if (parts.length <= 1) {
    return parseType(rawAnnotation);
  }

  const parsedTypes: MaybeParsed[] = [];

  for (const part of parts) {
    // Check if this part is a preservec external type
    // or a generic or if it's a known external type reference
    // (like HTMLAnchorAttributes["target"])

    if (PRESERVE_TYPE_NAMES.has(part) || genericNames.has(part) || part in TypeSrcMap) {
      parsedTypes.push(await parseType(part));
      continue;
    }

    // Check if it references an internal type alias that should be resolved
    if (isTypeAlias(part, contextNode)) {
      const resolvedAlias = await resolveTypeAliasMembers(part, contextNode);

      if (resolvedAlias) {
        parsedTypes.push(resolvedAlias);
        continue;
      }
    }

    // Keep as-is (literals, template literals, primitives)
    parsedTypes.push(await parseType(part));
  }

  return parsedTypes.length === 1 ? parsedTypes[0] : parsedTypes;
}

/**
 * Extracts the Snippet parameter type text from a full Snippet type string.
 * E.g. `Snippet<[{ expanded: boolean }]>` → `{ expanded: boolean }`.
 * Returns `undefined` for `Snippet` with no parameters.
 * Handles multiline Snippet annotations by normalizing whitespace.
 */
function resolveSnippetParams(typeText: string) {
  // Normalize whitespace (multiline Snippet annotations)
  const normalized = typeText.replace(/\s+/g, " ").trim();

  // Match Snippet<[...]> with possible whitespace
  const match = normalized.match(/^Snippet\s*<\s*\[\s*(.+?)\s*\]\s*>$/s);
  if (!match) {
    return;
  }

  return match[1].trim();
}
