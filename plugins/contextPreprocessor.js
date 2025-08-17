import { parse } from "@typescript-eslint/parser";
import MagicString from "magic-string";
import { format } from "prettier";

/** @type {string | undefined} */
let processedFile;

/**
 * @typedef Context
 * @property {ContextMember[]} members
 * @property {ContextInfo[]} infos
 */

/**
 * @type {Record<String, Context>}
 */
let context = {};

/**
 * @import { TSESTree } from "@typescript-eslint/types";
 */

/**
 * @typedef ContextMember
 * @property {string} key - The key of the context member.
 * @property {boolean} readonly - Whether the context member is readonly.
 */

/**
 * @typedef ContextInfo
 * @property {boolean} readonly - Whether the context member is readonly. Readonly members will not have a setter.
 * @property {string} key - The key of the context member (to name the getter/setter).
 * @property {TSESTree.Range} valueRange - The location of the context member's value (to be used inside the getter/setter).
 * @property {TSESTree.Range} expressionRange - The location of the context member. The text will be overwritten by a getter (and a setter if not readonly).
 */

/**
 * Preprocessor to ease the use of Svelte contexts.
 *
 * The goal is to automatically handle:
 * * - The use of symbols to make sure the context can only be used inside the lib
 * * - Reactivity with mutable/readonly variables by defining getters and setters
 *
 * @returns { import("svelte/types/compiler/preprocess").PreprocessorGroup }
 */
export function preprocessContext() {
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
 * @param {string | undefined} filename
 */
function resetContextForNewFile(filename) {
  processedFile = filename;
  context = {};
}

/**
 * Parse content and return AST
 * @param {string} content
 * @param {string | undefined} filename
 * @returns {TSESTree.Program}
 */
function parseContent(content, filename) {
  return parse(content, {
    sourceType: "module",
    filePath: filename,
    plugins: ["typescript"],
  });
}

/**
 * Process all AST nodes
 * @param {TSESTree.Program} ast
 */
function processASTNodes(ast) {
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
 * @param {TSESTree.Program} ast
 * @returns {TSESTree.TSInterfaceDeclaration[]}
 */
function collectContextInterfaces(ast) {
  /** @type {TSESTree.TSInterfaceDeclaration[]} */
  const contextInterfaces = [];
  ast.body.forEach((node) => {
    if (isContextInterface(node)) {
      contextInterfaces.push(node);
    }
  });
  return contextInterfaces;
}

/**
 * Check if node is a context interface
 * @param {TSESTree.ProgramStatement} node
 * @returns {node is TSESTree.TSInterfaceDeclaration}
 */
function isContextInterface(node) {
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
 * @param {MagicString} source
 */
function transformSourceCode(source) {
  for (const contextVarName in context) {
    transformContextMembers(source, contextVarName);
  }
}

/**
 * Transform context members for a specific context variable
 * @param {MagicString} source
 * @param {string} contextVarName
 */
function transformContextMembers(source, contextVarName) {
  for (const info of context[contextVarName].infos) {
    const { key, valueRange, expressionRange } = info;
    const value = source.slice(...valueRange);
    const transformedCode = createGetterSetter(key, value, info.readonly);
    source.overwrite(...expressionRange, transformedCode);
  }
}

/**
 * Format code using prettier
 * @param {string} code
 * @param {string | undefined} filename
 * @returns {Promise<string>}
 */
async function formatCode(code, filename) {
  return await format(code, {
    parser: "typescript",
    filepath: filename,
  });
}

/**
 * @param {TSESTree.ProgramStatement} node
 * @param {TSESTree.TSInterfaceDeclaration[]} contextInterfaces
 */
function handleContextInterfaces(node, contextInterfaces) {
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
 *
 * @param {TSESTree.ProgramStatement} node
 * @param {TSESTree.TSInterfaceDeclaration[]} contextInterfaces
 */
function handleContextMembers(node, contextInterfaces) {
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
 * @param {TSESTree.ProgramStatement} node
 * @returns {node is TSESTree.ExportNamedDeclaration & { declaration: TSESTree.VariableDeclaration & { declarations: [TSESTree.VariableDeclarator] } }}
 */
function isExportedVariableDeclaration(node) {
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
 * @param {TSESTree.ExportNamedDeclaration & { declaration: TSESTree.VariableDeclaration }} node
 * @returns {(TSESTree.VariableDeclarator & { id: TSESTree.Identifier }) | null}
 */
function extractVariableDeclarator(node) {
  const exported = node.declaration;
  const decl = exported.declarations[0];

  if (decl.type !== "VariableDeclarator" || decl.id.type !== "Identifier") {
    return null;
  }

  return /** @type {TSESTree.VariableDeclarator & { id: TSESTree.Identifier }} */ (decl);
}

/**
 * Check if init is a QContext call
 * @param {TSESTree.Expression | null} init
 * @returns {init is TSESTree.CallExpression & { callee: { name: "QContext" }, typeArguments: { params: [TSESTree.TypeNode] } }}
 */
function isQContextCall(init) {
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
 * @param {string} varName
 */
function initializeContext(varName) {
  context[varName] = {
    members: [],
    infos: [],
  };
}

/**
 * Extract type argument from QContext call
 * @param {TSESTree.CallExpression & { typeArguments: { params: [TSESTree.TypeNode] } }} init
 * @returns {TSESTree.TypeNode}
 */
function extractTypeArgument(init) {
  return init.typeArguments.params[0];
}

/**
 * Extract type members from type argument
 * @param {TSESTree.TypeNode} typeArg
 * @param {TSESTree.TSInterfaceDeclaration[]} contextInterfaces
 * @returns {TSESTree.TypeElement[] | null}
 */
function extractTypeMembers(typeArg, contextInterfaces) {
  if (isCorrectTypeReference(typeArg)) {
    return extractMembersFromTypeReference(typeArg, contextInterfaces);
  } else if (typeArg.type === "TSTypeLiteral") {
    return typeArg.members;
  }
  return null;
}

/**
 *
 * @param {TSESTree.TypeNode} typeArg
 * @returns {typeArg is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier }}
 */
function isCorrectTypeReference(typeArg) {
  return typeArg.type === "TSTypeReference" && typeArg.typeName.type === "Identifier";
}

/**
 * Extract members from type reference
 * @param {TSESTree.TSTypeReference & { typeName: TSESTree.Identifier }} typeArg
 * @param {TSESTree.TSInterfaceDeclaration[]} contextInterfaces
 * @returns {TSESTree.TypeElement[] | null}
 */
function extractMembersFromTypeReference(typeArg, contextInterfaces) {
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
 * @param {TSESTree.TypeElement[]} typeMembers
 * @param {string} varName
 * @param {TSESTree.TypeNode} typeArg
 */
function processTypeMembers(typeMembers, varName, typeArg) {
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
 * @param {TSESTree.TypeNode} typeArg
 * @returns {string | null}
 */
function getTypeName(typeArg) {
  if (typeArg.type === "TSTypeReference" && typeArg.typeName.type === "Identifier") {
    return typeArg.typeName.name;
  }
  return null;
}

/**
 * Check if member is a valid property signature
 * @param {TSESTree.TypeElement} member
 * @returns {member is TSESTree.TSPropertySignature}
 */
function isValidPropertySignature(member) {
  return member.type === "TSPropertySignature";
}

/**
 * Check if key is a valid identifier
 * @param {TSESTree.Expression} key
 * @returns {key is TSESTree.Identifier}
 */
function isValidIdentifierKey(key) {
  return key.type === "Identifier";
}

/**
 * @param {TSESTree.ProgramStatement} node
 * @param {string} contextVarName
 */
function handleContextSetting(node, contextVarName) {
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
 * @param {TSESTree.ProgramStatement} node
 * @param {string} contextVarName
 * @returns {node is TSESTree.ExpressionStatement}
 */
function isValidContextSettingNode(node, contextVarName) {
  return (
    (contextVarName &&
      context[contextVarName].members.length &&
      node.type === "ExpressionStatement") ||
    false
  );
}

/**
 * Check if expression is a valid context call
 * @param {TSESTree.Expression} expression
 * @param {string} contextVarName
 * @returns {expression is TSESTree.CallExpression & { callee: TSESTree.MemberExpression & { object: TSESTree.Identifier, property: TSESTree.Identifier } }}
 */
function isValidContextCall(expression, contextVarName) {
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
 * @param {TSESTree.CallExpression} expression
 * @param {string} propertyName
 * @returns {boolean}
 */
function hasValidArguments(expression, propertyName) {
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
 * @param {TSESTree.CallExpressionArgument} argument
 * @param {string} propertyName
 * @returns {argument is TSESTree.ObjectExpression}
 */
function isValidObjectExpression(argument, propertyName) {
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
 * @param {TSESTree.ObjectLiteralElement[]} properties
 * @param {string} contextVarName
 * @param {string} propertyName
 */
function processContextProperties(properties, contextVarName, propertyName) {
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
 * @param {TSESTree.ObjectLiteralElement[]} properties
 * @param {string} contextVarName
 * @param {string} propertyName
 * @returns {boolean}
 */
function hasValidPropertyCount(properties, contextVarName, propertyName) {
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
 * @param {TSESTree.ObjectLiteralElement} prop
 * @param {string} contextVarName
 * @returns {boolean}
 */
function processContextProperty(prop, contextVarName) {
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
 * @param {TSESTree.ObjectLiteralElement} prop
 * @returns {prop is TSESTree.Property}
 */
function isValidProperty(prop) {
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
 * @param {TSESTree.Expression} key
 * @returns {key is TSESTree.Identifier}
 */
function isValidPropertyKey(key) {
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
 * @param {string} contextVarName
 * @param {string} keyName
 * @returns {ContextMember | undefined}
 */
function findContextMember(contextVarName, keyName) {
  return context[contextVarName].members.find((m) => m.key === keyName);
}

/**
 * Add context info for processing
 *
 * @template {{ range: TSESTree.Range }} T
 *
 * @param {string} contextVarName
 * @param {ContextMember} member
 * @param {T} value
 * @param {TSESTree.Property} prop
 */
function addContextInfo(contextVarName, member, value, prop) {
  context[contextVarName].infos.push({
    readonly: member.readonly,
    key: member.key,
    valueRange: value.range,
    expressionRange: prop.range,
  });
}

/**
 * Create getter and setter code
 * @param {string} key
 * @param {string} value
 * @param {boolean} readonly
 * @returns {string}
 */
function createGetterSetter(key, value, readonly) {
  let code = createGetter(key, value);
  if (!readonly) {
    code += ",\n";
    code += createSetter(key, value);
  }
  return code;
}

/**
 * Create getter code for context member
 * @param {string} key
 * @param {string} value
 * @returns {string}
 */
function createGetter(key, value) {
  return `get ${key}() {
    return ${value};
  }`;
}

/**
 * Create setter code for context member
 * @param {string} key
 * @param {string} value
 * @returns {string}
 */
function createSetter(key, value) {
  return `set ${key}(newValue) {
    ${value} = newValue;
  }`;
}
