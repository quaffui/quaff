import ts from "typescript";

export type ParsedProp = {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
};

function isOptionalProp(declaration: ts.Declaration) {
  if (ts.isPropertySignature(declaration)) {
    return !!declaration.questionToken;
  } else return false;
}

function getJSDocComment(declaration: ts.Declaration) {
  if (ts.isPropertySignature(declaration)) {
    let com = ts.getJSDocCommentsAndTags(declaration)[0].comment;
    return typeof com === "string" ? com : Array.isArray(com) ? com.join("\n") : "";
  } else return "";
}

export default function parseInterface(fileName: string) {
  let program = ts.createProgram([fileName], { allowJs: true });
  let checker = program.getTypeChecker();
  let componentsToProps: {
    [key: string]: ParsedProp[];
  } = {};

  let visit = (node: ts.Node) => {
    if (!isNodeExported(node)) {
      return;
    }

    if (ts.isInterfaceDeclaration(node)) {
      let symbol = checker.getSymbolAtLocation(node.name)!;

      const interfaceName = symbol.getName();
      let props: ParsedProp[] = [];
      componentsToProps[interfaceName] = props;

      let allProps = getAllProperties(symbol, checker);

      allProps.map((prop) => {
        let curProp: ParsedProp = { name: "", type: "", optional: false };

        if (prop.declarations && prop.declarations.length > 0) {
          curProp.name = prop.getName();
          curProp.type = checker.typeToString(
            checker.getTypeOfSymbolAtLocation(prop, prop.declarations[0])
          );
          curProp.optional = isOptionalProp(prop.declarations[0]);
          curProp.description = getJSDocComment(prop.declarations[0]);

          //let commentRanges = ts.getLeadingCommentRanges(
          //  prop.declarations[0].getSourceFile().getFullText(),
          //  prop.declarations[0].getFullStart()
          //);
          //
          //let jsDocComments =
          //  commentRanges
          //    ?.filter(
          //      (range) =>
          //        range.kind === ts.SyntaxKind.MultiLineCommentTrivia && range.hasTrailingNewLine
          //    )
          //    .map((range) =>
          //      prop.declarations![0].getSourceFile().getFullText().substring(range.pos, range.end)
          //    )
          //    .join("\n") || "";
          //
          //curProp.description = jsDocComments
          //  .replace(/\/\*\*\n\s*\*\s*/, "")
          //  .replace(/\n\s+\*\/$/, "");
        }

        props.push(curProp);
      });
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

  return componentsToProps;
}

function getAllProperties(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Symbol[] {
  let properties: ts.Symbol[] = [];

  if (symbol.flags & ts.SymbolFlags.Interface) {
    let interfaceType = checker.getDeclaredTypeOfSymbol(symbol) as ts.InterfaceType;
    let baseTypes = interfaceType.getBaseTypes();

    properties.push(...checker.getPropertiesOfType(interfaceType));

    if (baseTypes) {
      baseTypes.forEach((baseType) => {
        properties.push(...getAllProperties(baseType.symbol, checker));
      });
    }
  }

  return properties;
}
