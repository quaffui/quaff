import { existsSync, readFileSync, writeFileSync } from "fs";
import ts from "typescript";

export default function parseType(fileName: string, typesPath: string) {
  let program = ts.createProgram([fileName], { allowJs: true });
  let checker = program.getTypeChecker();
  let types: Record<string, string> = existsSync(typesPath)
    ? JSON.parse(readFileSync(typesPath, "utf8"))
    : {};

  let visit = (node: ts.Node) => {
    if (!isNodeExported(node)) {
      return;
    }

    if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      const name = node.name.text;
      if (!name.includes("Props")) {
        const declaration = node
          .getText()
          .replace("; ", ", ")
          .replace(";", "")
          .replace("export ", "")
          .trim();

        types[name] = declaration;
      }
    }

    ts.forEachChild(node, visit);
  };

  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, visit);
    }
  }

  function isNodeExported(node: ts.Node): boolean {
    return (
      (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
      (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
    );
  }

  writeFileSync(typesPath, JSON.stringify(types));
}
