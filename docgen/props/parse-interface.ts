import ts from "typescript";

export type ParsedProp = {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
  default?: string;
  clickableType?: boolean;
};

function getJSDocComment(declaration: ts.Declaration) {
  if (ts.isPropertySignature(declaration)) {
    let comment = ts.getJSDocCommentsAndTags(declaration)[0];

    if (comment) {
      const commentText = comment.getText();
      const commentLines = commentText
        .split("\n")
        .map((line) => line.replaceAll(/\/|\*/g, "").trim())
        .filter(Boolean);

      const mainCommentLines = commentLines.filter((line) => !line.startsWith("@default"));
      const defaultCommentLines = commentLines.filter((line) => line.startsWith("@default"));

      const description = mainCommentLines.join("\n");
      const defaultValue =
        defaultCommentLines.length > 0 ? defaultCommentLines[0].split("@default")[1].trim() : "";

      return {
        description,
        default: defaultValue,
      };
    }
  }
  return {
    description: "",
    default: "",
  };
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

      let props: ParsedProp[] = [];
      const interfaceName = symbol.getName();
      componentsToProps[interfaceName] = props;

      for (const member of node.members) {
        let curProp: ParsedProp = { name: "", type: "", optional: false };
        if (ts.isPropertySignature(member) || ts.isPropertyDeclaration(member)) {
          curProp.name = member.name.getText();
          curProp.type = member.getText().split(": ").at(-1)?.replace(";", "") || "";
          curProp.optional = !!member.questionToken;

          let type = checker.getTypeAtLocation(member);
          curProp.clickableType =
            type.aliasSymbol !== undefined || curProp.type !== checker.typeToString(type);

          curProp = { ...curProp, ...getJSDocComment(member) };

          props.push(curProp);
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
