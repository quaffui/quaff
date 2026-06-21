import { Node, TypeFormatFlags } from "ts-morph";
import { ParsedGeneric, TypeSrcMap } from "./defs";
import { parseType } from "./parser";
import type { Project, InterfaceDeclaration, Type } from "ts-morph";

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
export function extractGenerics(interfaceDecl: InterfaceDeclaration) {
  return interfaceDecl.getTypeParameters().map((param) => {
    const result: ParsedGeneric = { name: param.getName() };
    const constraint = param.getConstraint();

    if (constraint) {
      const constraintText = constraint.getText();
      result.constraint = parseType(constraintText);
    }

    return result;
  });
}

/** Looks up a type name in `TypeSrcMap` and returns the URL if found. */
export function extractTypeSrc(typeText: string) {
  for (const [typeName, url] of Object.entries(TypeSrcMap)) {
    if (typeof url === "function") {
      const match = typeText.match(new RegExp(typeName));

      if (!match) {
        continue;
      }

      const { element, prop } = match.groups || {};

      if (!element && !prop) {
        throw new Error(`Missing element or prop match for ${typeName} in ${typeText}`);
      }

      if (prop && !element) {
        return url(prop);
      }

      return url(element, prop);
    }

    if (typeText === typeName || typeText.includes(typeName)) {
      return url;
    }
  }
}

/**
 * Finds the `HTMLAttributes<...>` or similar DOM extends clause from an interface.
 * Returns the full text (e.g. `HTMLAttributes<HTMLButtonElement>`) or `undefined`.
 */
export function extractDomConstraint(interfaceDecl: InterfaceDeclaration) {
  const extendsClauses = interfaceDecl.getExtends();

  for (const clause of extendsClauses) {
    const text = clause.getText();
    // Match patterns like HTMLAttributes<...>, HTMLDetailsAttributes, etc.
    if (text.includes("HTML") && text.includes("Attributes")) {
      return parseType(text);
    }
  }
}

/**
 * Collects property symbols from all extended internal (non-DOM, non-external)
 * interfaces, recursively. This "flattens" the modular interface hierarchy.
 */
export function extractExtendedInternalProperties(interfaceDecl: InterfaceDeclaration) {
  const properties = [];
  const extendsClauses = interfaceDecl.getExtends();

  for (const clause of extendsClauses) {
    const text = clause.getText();

    // Skip DOM/external extends (HTMLAttributes<...>, etc.)
    if (text.includes("HTML") && text.includes("Attributes")) {
      continue;
    }

    // Resolve the type of this extends clause
    const exprType = clause.getType();

    for (const prop of exprType.getProperties()) {
      properties.push(prop);
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

/** Extracts the `@default` tag value from a property's JSDoc, if present. */
export function extractDefaultValue(decl: Node) {
  if (!Node.isJSDocable(decl)) {
    return;
  }

  const jsDocs = decl.getJsDocs();
  if (jsDocs.length === 0) {
    return;
  }

  const doc = jsDocs[0];
  const tags = doc.getTags();
  const defaultTag = tags.find((tag) => tag.getTagName() === "default");

  if (!defaultTag) {
    return;
  }

  const commentText = defaultTag.getCommentText();
  return commentText?.trim();
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

  return typeNode.getText();
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
