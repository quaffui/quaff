import ts from "typescript";

export type ParsedDefault = {
  name: string;
  value: string;
};

export default function parseDefaults(fileName: string, variableName: string) {
  let program = ts.createProgram([fileName], { allowJs: true });
  program.getTypeChecker();
  let defaults: ParsedDefault[] = [];

  let visit = (node: ts.Node) => {
    if (!isNodeExported(node)) {
      return;
    }

    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (
          ts.isVariableDeclaration(declaration) &&
          declaration.name.kind === ts.SyntaxKind.Identifier &&
          declaration.name.text === `${variableName}Defaults` &&
          declaration.initializer &&
          ts.isObjectLiteralExpression(declaration.initializer)
        ) {
          declaration.initializer.properties.forEach((p) => {
            if (ts.isPropertyAssignment(p)) {
              let curDefault: ParsedDefault = {
                name: (p.name as ts.Identifier).text,
                value: evaluateNode(p.initializer), //.getText(),
              };
              defaults.push(curDefault);
            }
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, visit);
    }
  }

  return defaults;
}

function evaluateNode(node: ts.Node): any {
  switch (node.kind) {
    case ts.SyntaxKind.StringLiteral:
      return (node as ts.StringLiteral).text;
    case ts.SyntaxKind.NumericLiteral:
      return parseFloat((node as ts.NumericLiteral).text);
    case ts.SyntaxKind.TrueKeyword:
      return true;
    case ts.SyntaxKind.FalseKeyword:
      return false;
    case ts.SyntaxKind.NullKeyword:
      return null;
    case ts.SyntaxKind.UndefinedKeyword:
      return undefined;
    case ts.SyntaxKind.ArrayLiteralExpression:
      return (node as ts.ArrayLiteralExpression).elements.map(evaluateNode);
    case ts.SyntaxKind.ObjectLiteralExpression:
      const obj: any = {};
      (node as ts.ObjectLiteralExpression).properties.forEach((prop) => {
        if (ts.isPropertyAssignment(prop)) {
          obj[(prop.name as ts.Identifier).text] = evaluateNode(prop.initializer);
        }
      });
      return obj;
    case ts.SyntaxKind.Identifier:
      return (node as ts.Identifier).text;
    default:
      throw new Error(`Unknown syntax kind: ${ts.SyntaxKind[node.kind]}`);
  }
}

function isNodeExported(node: ts.Node): boolean {
  return (
    (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
    (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
  );
}
