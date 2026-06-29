import { InterfaceDeclaration, type Node, type Symbol as MorphSymbol } from "ts-morph";
import { format } from "prettier";
import {
  MaybeParsed,
  ParsedInterface,
  ParsedProperty,
  ParsedPropertyFlags,
  ParsedType,
} from "./defs";
import {
  extractDefaultValue,
  extractDescription,
  extractDomConstraint,
  extractExtendedInternalProperties,
  extractGenerics,
  extractTypeDefinition,
  extractTypeSrc,
} from "./extractor";
import { isPropertyBindable, isPropertyOptional } from "./checker";
import { resolvePropertyType } from "./resolver";

/**
 * Parses a full interface declaration into a `ParsedInterface`.
 * Collects direct properties and properties from extended internal interfaces.
 */
export async function parseInterface(
  interfaceDecl: InterfaceDeclaration
): Promise<[string, ParsedInterface]> {
  const name = interfaceDecl.getName();
  const generics = await extractGenerics(interfaceDecl);
  const domAttributesConstraint = await extractDomConstraint(interfaceDecl);

  const genericNames = new Set(generics.map((generic) => generic.name));

  // Using a Map to automatically handle duplicate property names
  // (later declarations override earlier ones, matching TS behavior).
  const propertyMap = new Map<string, ParsedProperty>();

  // 1. Collect properties from extended internal interfaces
  const extendedProps = extractExtendedInternalProperties(interfaceDecl);
  for (const prop of extendedProps) {
    const parsed = await parseProperty(prop, interfaceDecl, genericNames);
    propertyMap.set(parsed.name, parsed);
  }

  // 2. Collect the interface's own directly declared properties
  const ownProps = interfaceDecl.getProperties();
  for (const prop of ownProps) {
    const proSymbol = prop.getSymbol();

    if (proSymbol) {
      const parsed = await parseProperty(proSymbol, interfaceDecl, genericNames);
      propertyMap.set(parsed.name, parsed);
    }
  }

  const properties = Array.from(propertyMap.values());

  properties.sort((a, b) => a.name.localeCompare(b.name));

  const result: ParsedInterface = {
    generics,
    properties,
  };

  if (domAttributesConstraint) {
    result.domAttributesConstraint = domAttributesConstraint;
  }

  return [name, result];
}

/** Parses a given type, creating a `ParsedType` object from a string. */
export async function parseType(
  typeText: string,
  computedTypes: Record<string, MaybeParsed | MaybeParsed[]> = {}
): Promise<MaybeParsed> {
  const typeSrc = extractTypeSrc(typeText);

  const result: ParsedType = { text: typeText, typeDefinition: typeText };

  const maybeComputedTypes = Object.keys(computedTypes).length ? computedTypes : undefined;

  if (!typeSrc && !maybeComputedTypes) {
    return typeText;
  }

  if (typeSrc) {
    result.typeSrc = typeSrc;
  }

  if (maybeComputedTypes) {
    result.computedTypes = maybeComputedTypes;
  }

  const extractedDefinition = extractTypeDefinition(result, typeText);

  if (extractedDefinition) {
    const formatted = await format(extractedDefinition, { parser: "typescript" });
    result.typeDefinition = formatted;
  }

  return result;
}

/** Parses a single property symbol into a `ParsedProperty`. */
async function parseProperty(prop: MorphSymbol, contextNode: Node, genericNames: Set<string>) {
  const name = prop.getName();

  let description = "";
  let optionalFlag = ParsedPropertyFlags.NONE;
  let defaultValue;
  let bindableFlag = ParsedPropertyFlags.NONE;

  const declarations = prop.getDeclarations();
  const decl = declarations.at(0);

  if (decl) {
    description = extractDescription(decl);
    defaultValue = extractDefaultValue(decl);

    if (isPropertyOptional(decl)) {
      optionalFlag = ParsedPropertyFlags.OPTIONAL;
    }
    if (isPropertyBindable(decl)) {
      bindableFlag = ParsedPropertyFlags.BINDABLE;
    }
  }

  const { type, flags } = await resolvePropertyType(prop, decl, contextNode, genericNames);

  const result: ParsedProperty = {
    name,
    description,
    flags: flags | optionalFlag | bindableFlag,
    type,
  };

  result.default = defaultValue ?? "undefined";

  return result;
}
