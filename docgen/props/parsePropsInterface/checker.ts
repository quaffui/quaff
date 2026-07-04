import { Node, Type } from "ts-morph";
import { EXTERNAL_PACKAGE_PREFIXES } from "./defs";

/** Checks whether a property symbol's declaration has a `?` question token. */
export function isPropertyOptional(decl: Node) {
  if (Node.isPropertySignature(decl) || Node.isPropertyDeclaration(decl)) {
    return decl.hasQuestionToken();
  }

  return false;
}

/**
 * Checks if a type name is imported from an external package
 * (Svelte, Material Symbols) by inspecting the source file's imports.
 */
export function isImportedFromExternal(typeName: string, contextNode: Node): boolean {
  const sourceFile = contextNode.getSourceFile();

  for (const importDecl of sourceFile.getImportDeclarations()) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();

    for (const namedImport of importDecl.getNamedImports()) {
      if (namedImport.getName() === typeName) {
        return EXTERNAL_PACKAGE_PREFIXES.some((prefix) => moduleSpecifier.includes(prefix));
      }
    }
  }

  return false;
}

/**
 * Returns whether the type originates from an external package
 * (Svelte, Material Symbols, or DOM types) or is an internal type
 * (declared in the same file as the interface or within the project source).
 */
export function isTypeOriginatingFrom(type: Type, kind: "internal" | "external") {
  const symbol = type.getAliasSymbol() ?? type.getSymbol();
  if (!symbol) {
    return false;
  }

  const declarations = symbol.getDeclarations();
  if (!declarations.length) {
    return false;
  }

  const filePath = declarations[0].getSourceFile().getFilePath();
  return kind === "external"
    ? EXTERNAL_PACKAGE_PREFIXES.some((prefix) => filePath.includes(prefix))
    : !filePath.includes("node_modules");
}

/** Checks if a type name corresponds to a type alias in the project. */
export function isTypeAlias(typeName: string, contextNode: Node): boolean {
  const sourceFile = contextNode.getSourceFile();
  // Check local type alias
  const localAlias = sourceFile.getTypeAlias(typeName);

  if (localAlias) {
    return true;
  }

  // Check imported type alias
  for (const importDecl of sourceFile.getImportDeclarations()) {
    for (const namedImport of importDecl.getNamedImports()) {
      if (namedImport.getName() === typeName) {
        return true;
      }
    }
  }

  return false;
}
