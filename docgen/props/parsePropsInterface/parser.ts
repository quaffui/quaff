import { InterfaceDeclaration, Node, type Symbol as MorphSymbol } from "ts-morph";
import { format } from "prettier";
import {
  BUILTIN_TYPES,
  ParsedInterface,
  ParsedProperty,
  ParsedPropertyFlags,
  ParsedType,
  PRESERVE_TYPE_NAMES,
} from "./defs";
import {
  extractDescription,
  extractDomConstraint,
  extractExtendedInternalProperties,
  extractGenerics,
  extractInternalTypeReferenceSymbol,
  extractTypeSrc,
} from "./extractor";
import { isImportedFromExternal, isPropertyOptional, isTypeAlias } from "./checker";
import { resolvePropertyType } from "./resolver";
import { removeChildrenComments, simplifyExcludeUndefined, splitUnionParts } from "./utils";

/**
 * Parses a full interface declaration into a `ParsedInterface`.
 * Collects direct properties and properties from extended internal interfaces.
 */
export async function parseInterface(
  interfaceDecl: InterfaceDeclaration
): Promise<[string, ParsedInterface]> {
  const name = interfaceDecl.getName();
  const typeDependencies: Record<string, ParsedType | ParsedType[]> = {};

  const generics = await extractGenerics(interfaceDecl, typeDependencies);
  const domAttributesConstraint = await extractDomConstraint(interfaceDecl, typeDependencies);

  const genericNames = new Set(generics.map((generic) => generic.name));

  // Using a Map to automatically handle duplicate property names
  // (later declarations override earlier ones, matching TS behavior).
  const propertyMap = new Map<string, ParsedProperty>();

  // 1. Collect properties from extended internal interfaces
  const extendedProps = extractExtendedInternalProperties(interfaceDecl);

  for (const extProp of extendedProps) {
    const parsed = await parseProperty(
      extProp.symbol,
      interfaceDecl,
      genericNames,
      typeDependencies,
      extProp.decl,
      extProp.rawAnnotation
    );

    parsed.default = extProp.defaultValue;
    propertyMap.set(parsed.name, parsed);
  }

  // 2. Collect the interface's own directly declared properties
  const ownProps = interfaceDecl.getProperties();
  for (const prop of ownProps) {
    const proSymbol = prop.getSymbol();

    if (proSymbol) {
      const parsed = await parseProperty(proSymbol, interfaceDecl, genericNames, typeDependencies);
      propertyMap.set(parsed.name, parsed);
    }
  }

  const properties = Array.from(propertyMap.values());

  properties.sort((a, b) => a.name.localeCompare(b.name));

  const result: ParsedInterface = {
    generics,
    properties,
    typeDependencies,
  };

  if (domAttributesConstraint) {
    result.domAttributesConstraint = domAttributesConstraint;
  }

  return [name, result];
}

/** Parses a given type, creating a `ParsedType` object from a string. */
export async function parseType(
  typeText: string,
  typeDependencies: Record<string, ParsedType | ParsedType[]>,
  contextNode: Node,
  visited: Set<string> = new Set(),
  resolvedSymbol?: MorphSymbol
): Promise<ParsedType | ParsedType[]> {
  typeText = simplifyExcludeUndefined(typeText);
  const parts = splitUnionParts(typeText);

  if (parts.length > 1) {
    const resolvedParts = await Promise.all(
      parts.map((part) => parseType(part, typeDependencies, contextNode, visited))
    );
    return resolvedParts.flat();
  }

  const typeSrc = extractTypeSrc(typeText);

  if (typeSrc) {
    const name = typeText;
    const parsed: ParsedType = { name, typeSrc };
    typeDependencies[name] = parsed;
    return parsed;
  }

  if (PRESERVE_TYPE_NAMES.has(typeText) || BUILTIN_TYPES.has(typeText)) {
    return { definition: typeText };
  }

  // Handle arrays explicitly
  let baseTypeText = typeText;
  let isArray = false;
  if (typeText.endsWith("[]")) {
    baseTypeText = typeText.slice(0, -2);
    isArray = true;
  } else {
    const arrayMatch = typeText.match(/^Array<(.*)>$/);
    if (arrayMatch) {
      baseTypeText = arrayMatch[1].trim();
      isArray = true;
    }
  }

  if (isArray) {
    const baseSymbol = extractInternalTypeReferenceSymbol(baseTypeText, contextNode);
    if (baseSymbol) {
      await parseType(baseTypeText, typeDependencies, contextNode, visited, baseSymbol);
      const parsed: ParsedType = {
        name: typeText,
        definition: `type ${typeText} = ${baseTypeText}[];`,
        dependencies: [baseTypeText],
      };
      typeDependencies[typeText] = parsed;
      return parsed;
    }

    const baseSrc = extractTypeSrc(baseTypeText);

    if (baseSrc) {
      await parseType(baseTypeText, typeDependencies, contextNode);
      const parsed: ParsedType = {
        name: typeText,
        definition: `type ${typeText} = ${baseTypeText}[];`,
        dependencies: [baseTypeText],
      };
      typeDependencies[typeText] = parsed;
      return parsed;
    }
  }

  const symbol =
    resolvedSymbol ??
    (isTypeAlias(typeText, contextNode) || extractInternalTypeReferenceSymbol(typeText, contextNode)
      ? extractInternalTypeReferenceSymbol(typeText, contextNode)
      : undefined);

  if (symbol) {
    const decls = symbol.getDeclarations();

    decls.forEach((decl) => {
      decl.replaceWithText(decl.getText().replace(/export\s+/, ""));
    });

    if (decls.length > 0) {
      const decl = decls[0];
      const filePath = decl.getSourceFile().getFilePath();
      if (filePath.includes("node_modules")) {
        return { definition: typeText };
      }

      if (typeDependencies[typeText]) {
        return typeDependencies[typeText];
      }
      if (visited.has(typeText)) {
        return { name: typeText, definition: `type ${typeText} = any;`, dependencies: [] };
      }

      visited.add(typeText);
      removeChildrenComments(decl);

      let definition: string;
      if (
        Node.isInterfaceDeclaration(decl) ||
        Node.isTypeAliasDeclaration(decl) ||
        Node.isEnumDeclaration(decl) ||
        Node.isClassDeclaration(decl)
      ) {
        definition = decl.getText({ includeJsDocComments: false }).replaceAll("\n\n", "\n");
      } else {
        definition = `type ${typeText} = ${typeText};`;
      }

      const dependenciesSet = new Set<string>();
      const references = Array.from(new Set(definition.match(/\b([A-Z]\w*(?:\.\w+)*)\b/g) || []));

      for (const ref of references) {
        if (
          ref === typeText ||
          visited.has(ref) ||
          PRESERVE_TYPE_NAMES.has(ref) ||
          BUILTIN_TYPES.has(ref) ||
          isImportedFromExternal(ref, decl)
        ) {
          continue;
        }

        const refSymbol = extractInternalTypeReferenceSymbol(ref, decl);
        if (refSymbol) {
          dependenciesSet.add(ref);
          await parseType(ref, typeDependencies, decl, visited, refSymbol);
        }
      }

      const formatted = await format(definition, { parser: "typescript" });

      const parsed: ParsedType = {
        name: typeText,
        definition: formatted,
        dependencies: Array.from(dependenciesSet),
      };
      typeDependencies[typeText] = parsed;
      visited.delete(typeText);
      return parsed;
    }
  }

  return { definition: typeText };
}

/** Parses a single property symbol into a `ParsedProperty`. */
async function parseProperty(
  prop: MorphSymbol,
  contextNode: Node,
  genericNames: Set<string>,
  typeDependencies: Record<string, ParsedType | ParsedType[]>,
  customDecl?: Node,
  customRawAnnotation?: string
) {
  const name = prop.getName();

  let description = "";
  let optionalFlag = ParsedPropertyFlags.NONE;

  const declarations = prop.getDeclarations();
  const decl = customDecl ?? declarations.at(0);

  if (decl) {
    description = extractDescription(decl);

    if (isPropertyOptional(decl)) {
      optionalFlag = ParsedPropertyFlags.OPTIONAL;
    }
  }

  const { type, flags } = await resolvePropertyType(
    prop,
    decl,
    contextNode,
    genericNames,
    typeDependencies,
    customRawAnnotation
  );

  const result: ParsedProperty = {
    name,
    description,
    flags: flags | optionalFlag, // Bindable flag is handled later by the parseDefaults function
    type,
  };

  return result;
}
