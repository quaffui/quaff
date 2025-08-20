import { parse } from "@typescript-eslint/parser";
import MagicString from "magic-string";
import { format } from "prettier";
import { TSESTree as AST } from "@typescript-eslint/types";
import type { PreprocessorGroup } from "svelte/compiler";

interface Context {
  members: ContextMember[];
  infos: ContextInfo[];
}

interface ContextMember {
  /**
   * The key of the context member.
   */
  key: string;
  /**
   * Whether the context member is readonly.
   */
  readonly: boolean;
}

interface ContextInfo {
  /**
   * Whether the context member is readonly. Readonly members will not have a setter.
   */
  readonly: boolean;
  /**
   * The key of the context member (to name the getter/setter).
   */
  key: string;
  /**
   * The location of the context member's value (to be used inside the getter/setter).
   */
  valueRange: AST.Range;
  /**
   * The location of the context member. The text will be overwritten by a getter (and a setter if not readonly).
   */
  expressionRange: AST.Range;
}

let processedFile: string | undefined;

let context: Record<string, Context> = {};

/**
 * Preprocessor to ease the use of Svelte contexts.
 *
 * The goal is to automatically handle:
 * * The use of symbols to make sure the context can only be used inside the lib
 * * Reactivity with mutable/readonly variables by defining getters and setters
 */
export function preprocessContext(): PreprocessorGroup {
  return {
    name: "quaff-context-preprocessor",
    async script({ content, filename }) {
      if (filename !== processedFile) {
        resetContextForNewFile(filename);
      }

      const ast = parseContent(content, filename);

      processASTNodes(ast);

      if (!hasContexts()) {
        return;
      }

      const source = new MagicString(content);
      transformSourceCode(source);

      const code = await formatCode(source.toString(), filename);

      return {
        code,
        map: source.generateMap(),
        file: filename,
      };
    },
  };
}

/**
 * Reset context variables for a new file
 */
function resetContextForNewFile(filename: string | undefined) {
  processedFile = filename;
  context = {};
}

/**
 * Parse content and return AST
 */
function parseContent(content: string, filename: string | undefined): AST.Program {
  return parse(content, {
    sourceType: "module",
    filePath: filename,
    plugins: ["typescript"],
  });
}

/**
 * Process all AST nodes
 */
function processASTNodes(ast: AST.Program) {
  const contextInterfaces = collectContextInterfaces(ast);

  ast.body.forEach((node) => {
    handleContextInterfaces(node, contextInterfaces);
    handleContextMembers(node, contextInterfaces);

    for (const variable in context) {
      handleContextSetting(node, variable);
    }
  });
}

/**
 * Collect all context interfaces from AST
 */
function collectContextInterfaces(ast: AST.Program) {
  const contextInterfaces: AST.TSInterfaceDeclaration[] = [];
  ast.body.forEach((node) => {
    if (isContextInterface(node)) {
      contextInterfaces.push(node);
    }
  });
  return contextInterfaces;
}

/**
 * Check if node is a context interface
 */
function isContextInterface(node: AST.ProgramStatement): node is AST.TSInterfaceDeclaration {
  return (
    node.type === "TSInterfaceDeclaration" &&
    node.id.type === "Identifier" &&
    node.id.name.endsWith("Context")
  );
}

/**
 * Check if there are any contexts to process
 * @returns {boolean}
 */
function hasContexts() {
  return Object.keys(context).length > 0;
}

/**
 * Transform source code with getters and setters
 */
function transformSourceCode(source: MagicString) {
  for (const contextVarName in context) {
    transformContextMembers(source, contextVarName);
  }
}

/**
 * Transform context members for a specific context variable
 */
function transformContextMembers(source: MagicString, contextVarName: string) {
  for (const info of context[contextVarName].infos) {
    const { key, valueRange, expressionRange } = info;
    const value = source.slice(...valueRange);
    const transformedCode = createGetterSetter(key, value, info.readonly);
    source.overwrite(...expressionRange, transformedCode);
  }
}

/**
 * Format code using prettier
 */
async function formatCode(code: string, filename: string | undefined) {
  return await format(code, {
    parser: "typescript",
    filepath: filename,
  });
}

/**
 * Extract interfaces that end with "Context", possibly used for Svelte contexts
 */
function handleContextInterfaces(
  node: AST.ProgramStatement,
  contextInterfaces: AST.TSInterfaceDeclaration[]
) {
  if (
    node.type !== "TSInterfaceDeclaration" ||
    node.id.type !== "Identifier" ||
    !node.id.name.endsWith("Context")
  ) {
    return;
  }

  contextInterfaces.push(node);
}

/**
 * Extract the members' names in context interfaces and whether they are readonly and add them to `context`
 */
function handleContextMembers(
  node: AST.ProgramStatement,
  contextInterfaces: AST.TSInterfaceDeclaration[]
) {
  if (!isExportedVariableDeclaration(node)) {
    return;
  }

  const decl = extractVariableDeclarator(node);
  if (!decl) {
    return;
  }

  const { init, id } = decl;

  if (!isQContextCall(init)) {
    return;
  }

  initializeContext(id.name);

  const typeArg = extractTypeArgument(init);
  if (!typeArg) {
    return;
  }

  const typeMembers = extractTypeMembers(typeArg, contextInterfaces);
  if (!typeMembers) {
    return;
  }

  processTypeMembers(typeMembers, id.name, typeArg);
}

/**
 * Check if node is an exported variable declaration
 */
function isExportedVariableDeclaration(
  node: AST.ProgramStatement
): node is AST.ExportNamedDeclaration & {
  declaration: AST.VariableDeclaration & { declarations: [AST.VariableDeclarator] };
} {
  return (
    (node.type === "ExportNamedDeclaration" &&
      node.declaration &&
      node.declaration.type === "VariableDeclaration" &&
      node.declaration.declarations.length === 1) ??
    false
  );
}

/**
 * Extract variable declarator from node
 */
function extractVariableDeclarator(
  node: AST.ExportNamedDeclaration & { declaration: AST.VariableDeclaration }
) {
  const exported = node.declaration;
  const decl = exported.declarations[0];

  if (decl.type !== "VariableDeclarator" || decl.id.type !== "Identifier") {
    return null;
  }

  return decl as AST.VariableDeclarator & { id: AST.Identifier };
}

/**
 * Check if init is a QContext call
 */
function isQContextCall(init: AST.Expression | null): init is AST.CallExpression & {
  callee: { name: "QContext" };
  typeArguments: { params: [AST.TypeNode] };
} {
  return (
    (init?.type === "CallExpression" &&
      init.callee.type === "Identifier" &&
      init.callee.name === "QContext" &&
      init.typeArguments &&
      init.typeArguments.params.length === 1) ??
    false
  );
}

/**
 * Initialize context for variable name
 */
function initializeContext(varName: string) {
  context[varName] = {
    members: [],
    infos: [],
  };
}

/**
 * Extract type argument from QContext call
 */
function extractTypeArgument(
  init: AST.CallExpression & { typeArguments: { params: [AST.TypeNode] } }
) {
  return init.typeArguments.params[0];
}

/**
 * Extract type members from type argument
 */
function extractTypeMembers(
  typeArg: AST.TypeNode,
  contextInterfaces: AST.TSInterfaceDeclaration[]
) {
  if (isCorrectTypeReference(typeArg)) {
    return extractMembersFromTypeReference(typeArg, contextInterfaces);
  } else if (typeArg.type === "TSTypeLiteral") {
    return typeArg.members;
  }
  return null;
}

/**
 * Check if type argument is a correct type reference
 */
function isCorrectTypeReference(
  typeArg: AST.TypeNode
): typeArg is AST.TSTypeReference & { typeName: AST.Identifier } {
  return typeArg.type === "TSTypeReference" && typeArg.typeName.type === "Identifier";
}

/**
 * Extract members from type reference
 */
function extractMembersFromTypeReference(
  typeArg: AST.TSTypeReference & { typeName: AST.Identifier },
  contextInterfaces: AST.TSInterfaceDeclaration[]
) {
  const typeName = typeArg.typeName.name;

  if (!typeName.endsWith("Context")) {
    console.warn(`Invalid context type: ${typeName}. The context type must end with "Context".`);
    return null;
  }

  const foundInterface = contextInterfaces.find((node) => node.id.name === typeName);

  if (!foundInterface) {
    console.warn(
      `Context type ${typeName} is not defined in the file. Please define it as a TSInterfaceDeclaration.`
    );
    return null;
  }

  return foundInterface.body.body;
}

/**
 * Process type members and add them to context
 */
function processTypeMembers(
  typeMembers: AST.TypeElement[],
  varName: string,
  typeArg: AST.TypeNode
) {
  const typeName = getTypeName(typeArg);

  typeMembers.forEach((member) => {
    if (!isValidPropertySignature(member)) {
      console.warn(
        `Invalid member type: ${member.type} for ${typeName || "defined"} context. The context members must be TSPropertySignature.`
      );
      return;
    }

    const { key, readonly } = member;

    if (!isValidIdentifierKey(key)) {
      console.warn(
        `Invalid key type: ${key.type} for ${typeName || "defined"} context. The context members must be identifiers.`
      );
      return;
    }

    context[varName].members.push({ key: key.name, readonly });
  });
}

/**
 * Get type name from type argument
 */
function getTypeName(typeArg: AST.TypeNode) {
  if (typeArg.type === "TSTypeReference" && typeArg.typeName.type === "Identifier") {
    return typeArg.typeName.name;
  }
  return null;
}

/**
 * Check if member is a valid property signature
 */
function isValidPropertySignature(member: AST.TypeElement): member is AST.TSPropertySignature {
  return member.type === "TSPropertySignature";
}

/**
 * Check if key is a valid identifier
 */
function isValidIdentifierKey(key: AST.Expression): key is AST.Identifier {
  return key.type === "Identifier";
}

/**
 * Handle context setting
 */
function handleContextSetting(node: AST.ProgramStatement, contextVarName: string) {
  if (!isValidContextSettingNode(node, contextVarName)) {
    return;
  }

  const { expression } = node;

  if (!isValidContextCall(expression, contextVarName)) {
    return;
  }

  const { property } = expression.callee;

  if (!hasValidArguments(expression, property.name)) {
    return;
  }

  const argument = expression.arguments[0];

  if (!isValidObjectExpression(argument, property.name)) {
    return;
  }

  processContextProperties(argument.properties, contextVarName, property.name);
}

/**
 * Check if node is valid for context setting
 */
function isValidContextSettingNode(
  node: AST.ProgramStatement,
  contextVarName: string
): node is AST.ExpressionStatement {
  return (
    (contextVarName &&
      context[contextVarName].members.length &&
      node.type === "ExpressionStatement") ||
    false
  );
}

/**
 * Check if expression is a valid context call
 */
function isValidContextCall(
  expression: AST.Expression,
  contextVarName: string
): expression is AST.CallExpression & {
  callee: AST.MemberExpression & { object: AST.Identifier; property: AST.Identifier };
} {
  if (expression.type !== "CallExpression" || expression.callee.type !== "MemberExpression") {
    return false;
  }

  const { object, property } = expression.callee;

  return (
    object.type === "Identifier" && object.name === contextVarName && property.type === "Identifier"
  );
}

/**
 * Check if call has valid arguments
 */
function hasValidArguments(expression: AST.CallExpression, propertyName: string) {
  if (expression.arguments.length !== 1) {
    console.warn(
      `Invalid context setting: ${propertyName}. The context setting must have exactly one argument.`
    );
    return false;
  }
  return true;
}

/**
 * Check if argument is a valid object expression
 */
function isValidObjectExpression(
  argument: AST.CallExpressionArgument,
  propertyName: string
): argument is AST.ObjectExpression {
  if (argument.type !== "ObjectExpression") {
    console.warn(
      `Invalid context setting: ${propertyName}. The context setting must be an object.`
    );
    return false;
  }
  return true;
}

/**
 * Process context properties and validate them
 */
function processContextProperties(
  properties: AST.ObjectLiteralElement[],
  contextVarName: string,
  propertyName: string
) {
  if (!hasValidPropertyCount(properties, contextVarName, propertyName)) {
    return;
  }

  for (const prop of properties) {
    if (!processContextProperty(prop, contextVarName)) {
      return;
    }
  }
}

/**
 * Check if properties have valid count
 */
function hasValidPropertyCount(
  properties: AST.ObjectLiteralElement[],
  contextVarName: string,
  propertyName: string
) {
  if (properties.length !== context[contextVarName].members.length) {
    console.warn(
      `Invalid context setting: ${propertyName}. The context setting must have exactly ${context[contextVarName].members.length} properties.`
    );
    return false;
  }
  return true;
}

/**
 * Process a single context property
 */
function processContextProperty(prop: AST.ObjectLiteralElement, contextVarName: string) {
  if (!isValidProperty(prop)) {
    return false;
  }

  const { key, value } = prop;

  if (!isValidPropertyKey(key)) {
    return false;
  }

  const member = findContextMember(contextVarName, key.name);
  if (!member) {
    console.warn(`Context setting property ${key.name} is not defined in the context interface.`);
    return false;
  }

  addContextInfo(contextVarName, member, value, prop);
  return true;
}

/**
 * Check if property is valid
 */
function isValidProperty(prop: AST.ObjectLiteralElement): prop is AST.Property {
  if (prop.type !== "Property") {
    console.warn(
      `Invalid context setting property: ${prop.type}. The context setting properties must be Property nodes.`
    );
    return false;
  }
  return true;
}

/**
 * Check if property key is valid
 */
function isValidPropertyKey(key: AST.Expression): key is AST.Identifier {
  if (key.type !== "Identifier") {
    console.warn(
      `Invalid context setting key: ${key.type}. The context setting keys must be identifiers.`
    );
    return false;
  }
  return true;
}

/**
 * Find context member by key
 */
function findContextMember(contextVarName: string, keyName: string) {
  return context[contextVarName].members.find((m) => m.key === keyName);
}

/**
 * Add context info for processing
 */
function addContextInfo<T extends { range: AST.Range }>(
  contextVarName: string,
  member: ContextMember,
  value: T,
  prop: AST.Property
) {
  context[contextVarName].infos.push({
    readonly: member.readonly,
    key: member.key,
    valueRange: value.range,
    expressionRange: prop.range,
  });
}

/**
 * Create getter and setter code
 */
function createGetterSetter(key: string, value: string, readonly: boolean) {
  let code = createGetter(key, value);
  if (!readonly) {
    code += ",\n";
    code += createSetter(key, value);
  }
  return code;
}

/**
 * Create getter code for context member
 */
function createGetter(key: string, value: string) {
  return `get ${key}() {
    return ${value};
  }`;
}

/**
 * Create setter code for context member
 */
function createSetter(key: string, value: string) {
  return `set ${key}(newValue) {
    ${value} = newValue;
  }`;
}
