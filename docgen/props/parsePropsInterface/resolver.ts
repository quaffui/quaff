import { type Symbol as MorphSymbol, Node, type Type, TypeFormatFlags } from "ts-morph";
import { isTypeAlias, isTypeOriginatingFrom } from "./checker";
import {
  LARGE_UNION_THRESHOLD,
  ParsedPropertyFlags,
  PRESERVE_TYPE_NAMES,
  ParsedType,
} from "./defs";
import { extractRawTypeAnnotation, extractTypeText } from "./extractor";
import { parseType } from "./parser";
import { tryPreserveAnnotation, splitUnionParts } from "./utils";

/**
 * Core type resolution logic. Determines how to represent a property's type.
 */
export async function resolvePropertyType(
  prop: MorphSymbol,
  decl: Node | undefined,
  contextNode: Node,
  genericNames: Set<string>,
  typeDependencies: Record<string, ParsedType | ParsedType[]>,
  customRawAnnotation?: string
) {
  const propType = prop.getTypeAtLocation(contextNode);
  const nonNullType = propType.getNonNullableType();
  const rawAnnotation = customRawAnnotation ?? extractRawTypeAnnotation(decl);
  const checkNode = decl ?? contextNode;

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
      const utilityType = await tryResolveUtilityTypes(
        elementRawAnnotation,
        checkNode,
        typeDependencies
      );
      if (utilityType) {
        return {
          type: utilityType.type,
          flags: ParsedPropertyFlags.ARRAY | utilityType.flag,
        };
      }

      const preserved = await tryPreserveAnnotation(
        elementRawAnnotation,
        checkNode,
        typeDependencies
      );

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
        checkNode,
        elementRawAnnotation,
        typeDependencies,
        decl
      );
      return {
        type: res,
        flags: ParsedPropertyFlags.ARRAY,
      };
    }

    if (elementType.isUnion()) {
      const res = await resolveUnionType(
        elementType,
        checkNode,
        genericNames,
        elementRawAnnotation,
        typeDependencies,
        decl
      );
      return {
        type: res,
        flags: ParsedPropertyFlags.ARRAY,
      };
    }

    const elementText = extractTypeText(elementType, checkNode);
    return {
      type: await parseType(elementRawAnnotation ?? elementText, typeDependencies, checkNode),
      flags: ParsedPropertyFlags.ARRAY,
    };
  }

  // Check if the raw annotation is a Snippet type
  if (rawAnnotation && rawAnnotation.startsWith("Snippet")) {
    const params = resolveSnippetParams(rawAnnotation);
    return {
      type: await parseType(params ?? "void", typeDependencies, checkNode),
      flags: ParsedPropertyFlags.SNIPPET,
    };
  }

  // Check if it's a Snippet from a resolved type (e.g. when inherited)
  const aliasSymbol = propType.getAliasSymbol();
  const resolvedText = extractTypeText(nonNullType, checkNode);

  if (aliasSymbol?.getName() === "Snippet" || resolvedText.startsWith("Snippet")) {
    const fullText = aliasSymbol
      ? nonNullType.getText(checkNode, TypeFormatFlags.NoTruncation)
      : resolvedText;
    const params = resolveSnippetParams(fullText);

    return {
      type: await parseType(params ?? "void", typeDependencies, checkNode),
      flags: ParsedPropertyFlags.SNIPPET,
    };
  }

  // Check if the raw annotation references a preserved or external type
  if (rawAnnotation) {
    const utilityType = await tryResolveUtilityTypes(rawAnnotation, checkNode, typeDependencies);

    if (utilityType) {
      return {
        type: utilityType.type,
        flags: utilityType.flag,
      };
    }

    const preserved = await tryPreserveAnnotation(rawAnnotation, checkNode, typeDependencies);

    if (preserved) {
      return {
        type: preserved,
        flags: ParsedPropertyFlags.NONE,
      };
    }
  }

  // Handle boolean types
  if (
    nonNullType.isBoolean() ||
    nonNullType.isBooleanLiteral() ||
    (nonNullType.isUnion() &&
      nonNullType.getUnionTypes().every((union) => union.isBooleanLiteral()))
  ) {
    return {
      type: await parseType("boolean", typeDependencies, checkNode),
      flags: ParsedPropertyFlags.NONE,
    };
  }

  // Handle union types
  if (nonNullType.isUnion()) {
    return {
      type: await resolveUnionType(
        nonNullType,
        checkNode,
        genericNames,
        rawAnnotation,
        typeDependencies,
        decl
      ),
      flags: ParsedPropertyFlags.NONE,
    };
  }

  // Handle `keyof X` types and types that use a generic parameter
  if (rawAnnotation && (rawAnnotation.startsWith("keyof ") || genericNames.has(rawAnnotation))) {
    return {
      type: await parseType(rawAnnotation, typeDependencies, checkNode),
      flags: ParsedPropertyFlags.NONE,
    };
  }

  // Handle aliased types
  if (aliasSymbol) {
    return {
      type: await resolveAliasedType(
        nonNullType,
        aliasSymbol,
        checkNode,
        rawAnnotation,
        typeDependencies,
        decl
      ),
      flags: ParsedPropertyFlags.NONE,
    };
  }

  // Default: use the resolved type text
  return {
    type: await parseType(resolvedText, typeDependencies, checkNode),
    flags: ParsedPropertyFlags.NONE,
  };
}

/**
 * Resolves a type that has an alias symbol.
 */
async function resolveAliasedType(
  type: Type,
  aliasSymbol: MorphSymbol,
  contextNode: Node,
  rawAnnotation: string | undefined,
  typeDependencies: Record<string, ParsedType | ParsedType[]>,
  decl: Node | undefined
) {
  const aliasName = aliasSymbol.getName();
  const checkNode = decl ?? contextNode;

  // Preserve well-known external types
  if (PRESERVE_TYPE_NAMES.has(aliasName)) {
    return parseType(aliasName, typeDependencies, checkNode);
  }

  // External types: keep as-is
  if (isTypeOriginatingFrom(type, "external")) {
    const fullText = type.getText(checkNode, TypeFormatFlags.NoTruncation);
    return parseType(fullText, typeDependencies, checkNode);
  }

  // Internal alias: resolve via parseType
  return parseType(rawAnnotation ?? aliasName, typeDependencies, checkNode, new Set(), aliasSymbol);
}

/**
 * Resolves a union type into either a single `ParsedType` (if the alias should be preserved)
 * or an array of `ParsedType` (for each union member).
 */
async function resolveUnionType(
  type: Type,
  contextNode: Node,
  genericNames: Set<string>,
  rawAnnotation: string | undefined,
  typeDependencies: Record<string, ParsedType | ParsedType[]>,
  decl: Node | undefined
): Promise<ParsedType | ParsedType[]> {
  const checkNode = decl ?? contextNode;
  const unionTypes = type.getUnionTypes();
  const aliasSymbol = type.getAliasSymbol();

  if (!aliasSymbol && rawAnnotation && isTypeAlias(rawAnnotation, checkNode)) {
    return parseType(rawAnnotation, typeDependencies, checkNode);
  }

  if (aliasSymbol) {
    const aliasName = aliasSymbol.getName();

    // Preserve external types like MaterialSymbol or Snippet
    if (PRESERVE_TYPE_NAMES.has(aliasName)) {
      return parseType(aliasName, typeDependencies, checkNode);
    }

    // Internal type alias: resolve to the aliasName
    if (isTypeOriginatingFrom(type, "internal")) {
      return parseType(aliasName, typeDependencies, checkNode);
    }

    // Large unions (external): show the alias name
    if (unionTypes.length > LARGE_UNION_THRESHOLD) {
      return parseType(aliasName, typeDependencies, checkNode);
    }
  }

  // If the raw annotation contains a union with diverse types
  if (rawAnnotation?.includes("|")) {
    return resolveRawUnionAnnotation(rawAnnotation, checkNode, genericNames, typeDependencies);
  }

  // Simple union: map each member
  if (unionTypes.length <= LARGE_UNION_THRESHOLD) {
    const resolvedParts = await Promise.all(
      unionTypes.map((union) =>
        parseType(extractTypeText(union, checkNode), typeDependencies, checkNode)
      )
    );
    return resolvedParts.flat();
  }

  // Fallback for large unions without alias
  return parseType(extractTypeText(type, checkNode), typeDependencies, checkNode);
}

/**
 * Parses a raw union annotation into individual ParsedType entries.
 */
async function resolveRawUnionAnnotation(
  rawAnnotation: string,
  contextNode: Node,
  genericNames: Set<string>,
  typeDependencies: Record<string, ParsedType | ParsedType[]>
): Promise<ParsedType | ParsedType[]> {
  const parts = splitUnionParts(rawAnnotation);

  if (parts.length <= 1) {
    return parseType(rawAnnotation, typeDependencies, contextNode);
  }

  const parsedTypes: (ParsedType | ParsedType[])[] = [];

  for (const part of parts) {
    parsedTypes.push(await parseType(part, typeDependencies, contextNode));
  }

  const flattened = parsedTypes.flat();
  return flattened.length === 1 ? flattened[0] : flattened;
}

/**
 * Extracts the Snippet parameter type text from a Snippet type string.
 */
function resolveSnippetParams(typeText: string) {
  const normalized = typeText.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^Snippet\s*<\s*\[\s*(.+?)\s*\]\s*>$/s);
  if (!match) {
    return;
  }
  return match[1].trim();
}

/**
 * Resolves typescript utility types (Omit, Exclude, Pick, Extract)
 */
async function tryResolveUtilityTypes(
  rawAnnotation: string | undefined,
  contextNode: Node,
  typeDependencies: Record<string, ParsedType | ParsedType[]>
): Promise<{ type: [ParsedType, ParsedType]; flag: ParsedPropertyFlags } | undefined> {
  if (!rawAnnotation) {
    return undefined;
  }

  const collapse = (parsed: ParsedType | ParsedType[]): ParsedType => {
    if (!Array.isArray(parsed)) {
      return parsed;
    }
    const parts = parsed.map((p) => ("name" in p ? p.name : p.definition));
    return {
      definition: parts.join(" | "),
    };
  };

  const omitMatch = rawAnnotation.match(/^Omit\s*<\s*(.+?)\s*,\s*(.+?)\s*>$/s);
  if (omitMatch) {
    const targetType = omitMatch[1].trim();
    const keys = omitMatch[2].trim();
    const parsedTarget = collapse(await parseType(targetType, typeDependencies, contextNode));
    const parsedKeys = collapse(await parseType(keys, typeDependencies, contextNode));
    return {
      type: [parsedTarget, parsedKeys],
      flag: ParsedPropertyFlags.OMIT,
    };
  }

  const excludeMatch = rawAnnotation.match(/^Exclude\s*<\s*(.+?)\s*,\s*(.+?)\s*>$/s);
  if (excludeMatch) {
    const targetType = excludeMatch[1].trim();
    const excluded = excludeMatch[2].trim();
    const parsedTarget = collapse(await parseType(targetType, typeDependencies, contextNode));
    const parsedExcluded = collapse(await parseType(excluded, typeDependencies, contextNode));
    return {
      type: [parsedTarget, parsedExcluded],
      flag: ParsedPropertyFlags.EXCLUDE,
    };
  }

  const pickMatch = rawAnnotation.match(/^Pick\s*<\s*(.+?)\s*,\s*(.+?)\s*>$/s);
  if (pickMatch) {
    const targetType = pickMatch[1].trim();
    const keys = pickMatch[2].trim();
    const parsedTarget = collapse(await parseType(targetType, typeDependencies, contextNode));
    const parsedKeys = collapse(await parseType(keys, typeDependencies, contextNode));
    return {
      type: [parsedTarget, parsedKeys],
      flag: ParsedPropertyFlags.PICK,
    };
  }

  const extractMatch = rawAnnotation.match(/^Extract\s*<\s*(.+?)\s*,\s*(.+?)\s*>$/s);
  if (extractMatch) {
    const targetType = extractMatch[1].trim();
    const extracted = extractMatch[2].trim();
    const parsedTarget = collapse(await parseType(targetType, typeDependencies, contextNode));
    const parsedExtracted = collapse(await parseType(extracted, typeDependencies, contextNode));
    return {
      type: [parsedTarget, parsedExtracted],
      flag: ParsedPropertyFlags.EXTRACT,
    };
  }

  return undefined;
}
