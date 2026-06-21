import { InterfaceDeclaration, type Node, type Symbol as MorphSymbol } from "ts-morph";
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
  extractTypeSrc,
} from "./extractor";
import { isPropertyBindable, isPropertyOptional } from "./checker";
import { resolvePropertyType } from "./resolver";

/**
 * Parses a full interface declaration into a `ParsedInterface`.
 * Collects direct properties and properties from extended internal interfaces.
 */
export function parseInterface(interfaceDecl: InterfaceDeclaration): [string, ParsedInterface] {
  const name = interfaceDecl.getName();
  const generics = extractGenerics(interfaceDecl);
  const domAttributesConstraint = extractDomConstraint(interfaceDecl);

  const genericNames = new Set(generics.map((generic) => generic.name));

  const properties: ParsedProperty[] = [];

  // 1. Collect properties from extended internal interfaces
  const extendedProps = extractExtendedInternalProperties(interfaceDecl);
  for (const prop of extendedProps) {
    properties.push(parseProperty(prop, interfaceDecl, genericNames));
  }

  // 2. Collect the interface's own directly declared properties
  const ownProps = interfaceDecl.getProperties();
  for (const prop of ownProps) {
    const proSymbol = prop.getSymbol();

    if (proSymbol) {
      properties.push(parseProperty(proSymbol, interfaceDecl, genericNames));
    }
  }

  properties.sort((a, b) => a.name.localeCompare(b.name));

  const result: ParsedInterface = {
    name,
    generics,
    properties,
  };

  if (domAttributesConstraint) {
    result.domAttributesConstraint = domAttributesConstraint;
  }

  return [name, result];
}

/** Parses a given type, creating a `ParsedType` object from a string. */
export function parseType(
  typeText: string,
  computedTypes: Record<string, MaybeParsed | MaybeParsed[]> = {}
): MaybeParsed {
  const typeSrc = extractTypeSrc(typeText);

  const result: ParsedType = { text: typeText };

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

  return result;
}

/** Parses a single property symbol into a `ParsedProperty`. */
function parseProperty(prop: MorphSymbol, contextNode: Node, genericNames: Set<string>) {
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

  const { type, flags } = resolvePropertyType(prop, decl, contextNode, genericNames);

  const result: ParsedProperty = {
    name,
    description,
    flags: flags | optionalFlag | bindableFlag,
    type,
  };

  result.default = defaultValue ?? "undefined";

  return result;
}
