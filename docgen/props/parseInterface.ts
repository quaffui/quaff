import ts from "typescript";

export interface PropType {
  name: string;
  isClickable: boolean;
}

export interface SnippetType extends PropType {
  optional: boolean;
  propName: string;
}

export interface ParsedPropBase {
  name: string;
  optional: boolean;
  description?: string;
  default?: string;
  isArray: boolean;
}

export interface ParsedProp extends ParsedPropBase {
  isSnippet: false;
  type: PropType | PropType[];
}

export interface ParsedSnippet extends ParsedPropBase {
  isSnippet: true;
  type: SnippetType[];
}

export type ParsedPropOrSnippet = ParsedProp | ParsedSnippet;

function getJSDocComment(declaration: ts.Declaration) {
  if (ts.isPropertySignature(declaration)) {
    const comment = ts.getJSDocCommentsAndTags(declaration)[0];

    if (comment) {
      const commentText = comment.getText();
      const commentLines = commentText
        .split("\n")
        .map((line) => line.replaceAll(/\/\*|\*\/|\*/g, "").trim())
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
  const program = ts.createProgram([fileName], { allowJs: true });
  const checker = program.getTypeChecker();
  const componentsToProps: {
    [key: string]: ParsedPropOrSnippet[];
  } = {};

  const visit = (node: ts.Node) => {
    if (!isNodeExported(node)) {
      return;
    }

    if (ts.isInterfaceDeclaration(node)) {
      const symbol = checker.getSymbolAtLocation(node.name)!;

      const props: ParsedPropOrSnippet[] = [];
      const interfaceName = symbol.getName();
      componentsToProps[interfaceName] = props;

      for (const member of node.members) {
        let curProp = { isArray: false, optional: false, isSnippet: false } as ParsedPropOrSnippet;
        if (ts.isPropertySignature(member) || ts.isPropertyDeclaration(member)) {
          curProp.name = member.name.getText();
          curProp.optional = !!member.questionToken;

          const memberType = member.type;
          if (!memberType) {
            continue;
          }

          if (ts.isArrayTypeNode(memberType)) {
            curProp.isArray = true;

            const elementTypeNode = memberType.elementType;
            curProp.type = evaluateTypeNode(elementTypeNode);
          } else if (
            memberType.getText().startsWith("Snippet") &&
            ts.isTypeReferenceNode(memberType)
          ) {
            curProp.isSnippet = true;

            const args = memberType.typeArguments?.[0];

            if (args && ts.isTupleTypeNode(args)) {
              curProp.type = evaluateTypeNode(args.elements[0]);
            } else {
              curProp.type = [];
            }
          } else {
            curProp.type = evaluateTypeNode(memberType);
          }

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

  return componentsToProps;
}

function isNodeExported(node: ts.Node): boolean {
  return (
    (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
    (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
  );
}

function evaluateTypeNode(node: ts.TypeNode): PropType | (PropType | SnippetType)[] {
  if (ts.isUnionTypeNode(node)) {
    return node.types.map(evaluateTypeNode) as PropType[];
  }

  if (ts.isTypeLiteralNode(node)) {
    if (!node.members.every(ts.isPropertySignature)) {
      return [];
    }

    return (node.members as ts.NodeArray<ts.PropertySignature>).map((member) => ({
      propName: member.name.getText(),
      isClickable: !!member.type && ts.isTypeReferenceNode(member.type),
      optional: !!member.questionToken,
      name: member.type!.getText().trim(),
    }));
  }

  const name = node.getText().trim();

  const typesToIgnore = [
    "MaterialSymbol",
    "MouseEventHandler",
    "Snippet",
    "HTML",
    "Q.",
    "Exclude",
    "Omit",
  ];

  return {
    name,
    isClickable:
      ts.isTypeReferenceNode(node) && typesToIgnore.every((type) => !name.startsWith(type)),
  };
}
