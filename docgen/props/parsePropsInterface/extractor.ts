import { Node, TypeFormatFlags } from "ts-morph";
import { type ParsedGeneric, type ParsedType, TypeSrcMap } from "./defs";
import { parseType } from "./parser";
import type { Project, InterfaceDeclaration, Type, Symbol as MorphSymbol } from "ts-morph";

export interface ExtendedProperty {
  symbol: MorphSymbol;
  decl?: Node;
  rawAnnotation?: string;
}

/**
 * Finds all exported interface declarations that end with `Props` in a source file.
 * Throws if the source file is not found.
 */
export function extractInterfaces(project: Project, filePath: string) {
  const sourceFile = project.getSourceFileOrThrow(filePath);

  const interfaces = sourceFile.getInterfaces();

  return interfaces.filter((int) => int.isExported() && int.getName().endsWith("Props"));
}

/** Parses generic type parameters from an interface declaration into `ParsedGeneric[]`. */
export async function extractGenerics(
  interfaceDecl: InterfaceDeclaration,
  typeDependencies: Record<string, ParsedType | ParsedType[]>
) {
  return Promise.all(
    interfaceDecl.getTypeParameters().map(async (param) => {
      const result: ParsedGeneric = { name: param.getName() };
      const constraint = param.getConstraint();

      if (constraint) {
        const constraintText = constraint.getText();
        const parsed = await parseType(constraintText, typeDependencies, constraint);
        result.constraint = Array.isArray(parsed) ? parsed[0] : parsed;
      }

      return result;
    })
  );
}

/** Looks up a type name in `TypeSrcMap` and returns the URL if found. */
export function extractTypeSrc(typeText: string) {
  for (const [typeName, url] of TypeSrcMap) {
    if (typeof url === "function") {
      const match = typeText.match(typeName);

      if (!match) {
        continue;
      }

      const { element, prop, event } = match.groups || {};

      if (!element && !prop && !event) {
        throw new Error(`Missing element, prop or event match for ${typeName} in ${typeText}`);
      }

      if ((prop || event) && !element) {
        return url(prop ?? event);
      }

      return url(element, prop);
    }

    const isMatch =
      typeof typeName === "string"
        ? typeText === typeName || typeText.includes(typeName)
        : typeName.test(typeText);

    if (isMatch) {
      return url;
    }
  }
}

/**
 * Finds the `HTMLAttributes<...>` or similar DOM extends clause from an interface.
 * Returns the full text (e.g. `HTMLAttributes<HTMLButtonElement>`) or `undefined`.
 */
export async function extractDomConstraint(
  interfaceDecl: InterfaceDeclaration,
  typeDependencies: Record<string, ParsedType | ParsedType[]>
) {
  const extendsClauses = interfaceDecl.getExtends();

  for (const clause of extendsClauses) {
    const text = clause.getText();
    // Match patterns like HTMLAttributes<...>, HTMLDetailsAttributes, etc.
    if (text.includes("HTML") && text.includes("Attributes")) {
      const parsed = await parseType(text, typeDependencies, clause);
      return Array.isArray(parsed) ? parsed[0] : parsed;
    }
  }
}

/**
 * Collects property symbols and their declaration details from all extended internal
 * (non-DOM, non-external) interfaces, recursively. This "flattens" the modular interface hierarchy
 * and substitutes generic parameter types with their actual type arguments.
 */
export function extractExtendedInternalProperties(
  interfaceDecl: InterfaceDeclaration
): ExtendedProperty[] {
  const properties: ExtendedProperty[] = [];
  const extendsClauses = interfaceDecl.getExtends();

  for (const clause of extendsClauses) {
    const text = clause.getText();

    // Skip DOM/external extends (HTMLAttributes<...>, etc.)
    if (text.includes("HTML") && text.includes("Attributes")) {
      continue;
    }

    // Resolve the type of this extends clause
    const exprType = clause.getType();
    const symbol = exprType.getSymbol();

    const paramMap = new Map<string, string>();
    if (symbol) {
      const decl = symbol.getDeclarations()[0];
      if (decl && Node.isInterfaceDeclaration(decl)) {
        const typeParams = decl.getTypeParameters();
        const typeArgs = clause.getTypeArguments();
        for (let i = 0; i < typeParams.length; i++) {
          const param = typeParams[i];
          const arg = typeArgs[i];
          const paramName = param.getName();
          if (arg) {
            paramMap.set(paramName, arg.getText());
          } else {
            const defaultType = param.getDefault();
            if (defaultType) {
              paramMap.set(paramName, defaultType.getText());
            }
          }
        }
      }
    }

    for (const prop of exprType.getProperties()) {
      const decls = prop.getDeclarations();
      const propDecl = decls[0];
      let rawAnnotation: string | undefined;

      if (propDecl && Node.isPropertySignature(propDecl)) {
        const typeNode = propDecl.getTypeNode();
        if (typeNode) {
          rawAnnotation = typeNode.getText({ includeJsDocComments: false });
          if (paramMap.size > 0) {
            for (const [paramName, argText] of paramMap.entries()) {
              const regex = new RegExp(`\\b${paramName}\\b`, "g");
              rawAnnotation = rawAnnotation.replace(regex, argText);
            }
          }
        }
      }

      properties.push({
        symbol: prop,
        decl: propDecl,
        rawAnnotation,
      });
    }
  }

  return properties;
}

/** Extracts the main JSDoc description text from a property's declarations, excluding `@default` lines. */
export function extractDescription(decl: Node) {
  if (!Node.isJSDocable(decl)) {
    return "";
  }

  const jsDocs = decl.getJsDocs();
  if (!jsDocs.length) {
    return "";
  }

  const doc = jsDocs[0];
  const description = doc.getDescription();

  return description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

/**
 * Extracts the raw type text for a property declaration node.
 * This reads the type annotation directly from the source code,
 * which is needed for cases like template literals and Snippet types.
 */
export function extractRawTypeAnnotation(decl: Node | undefined): string | undefined {
  if (!Node.isPropertySignature(decl)) {
    return undefined;
  }

  const typeNode = decl.getTypeNode();
  if (!typeNode) {
    return undefined;
  }

  return typeNode.getText({ includeJsDocComments: false });
}

/** Looks up an internal type reference (alias, interface, enum, namespace dot-path) by name and returns its Symbol. */
export function extractInternalTypeReferenceSymbol(typeName: string, contextNode: Node) {
  const parts = typeName.split(".");
  const baseName = parts[0];

  const sourceFile = contextNode.getSourceFile();
  const typeChecker = sourceFile.getProject().getTypeChecker();

  let baseSymbol;

  const getLocalDeclaration = (type: "TypeAlias" | "Interface" | "Enum") => {
    const fn = `get${type}` as const;
    const localDecl = sourceFile[fn](baseName);

    return localDecl?.getSymbol();
  };

  baseSymbol =
    getLocalDeclaration("TypeAlias") ??
    getLocalDeclaration("Interface") ??
    getLocalDeclaration("Enum");

  if (!baseSymbol) {
    for (const importDecl of sourceFile.getImportDeclarations()) {
      for (const nameImport of importDecl.getNamedImports()) {
        if (nameImport.getName() === baseName) {
          const symbol = nameImport.getNameNode().getSymbol();
          if (symbol) {
            baseSymbol = typeChecker.getAliasedSymbol(symbol) ?? symbol;
          }
        }
      }
    }
  }

  if (!baseSymbol) {
    for (const srcFile of contextNode.getProject().getSourceFiles()) {
      const globalModule = srcFile.getModule("global");
      baseSymbol =
        globalModule?.getModule(baseName)?.getSymbol() ?? srcFile.getModule(baseName)?.getSymbol();

      if (baseSymbol) {
        break;
      }
    }
  }

  if (!baseSymbol) {
    return;
  }

  let currentSymbol = baseSymbol;
  for (let i = 1; i < parts.length; i++) {
    const exportSymbol = currentSymbol.getExport(parts[i]);
    if (!exportSymbol) {
      return;
    }

    currentSymbol = typeChecker.getAliasedSymbol(exportSymbol) ?? exportSymbol;
  }

  return currentSymbol;
}

/**
 * Extracts the non-truncated text of a type, using the given node as context.
 * Strips `undefined` from optional types (uses `getNonNullableType`).
 */
export function extractTypeText(type: Type, contextNode: Node) {
  return type.getText(contextNode, TypeFormatFlags.NoTruncation | TypeFormatFlags.InTypeAlias);
}
