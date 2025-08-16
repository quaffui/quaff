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
        // New file, we reset all context-related variables
        processedFile = filename;
        context = {};
      }

      const source = new MagicString(content);

      const ast = parse(content, {
        sourceType: "module",
        filePath: filename,
        plugins: ["typescript"],
      });

      /** @type {TSESTree.TSInterfaceDeclaration[]} */
      const contextInterfaces = [];

      ast.body.forEach((node) => {
        handleContextInterfaces(node, contextInterfaces);
        handleContextMembers(node, contextInterfaces);

        for (const variable in context) {
          handleContextSetting(node, variable);
        }
      });

      if (!Object.keys(context).length) {
        return;
      }

      for (const contextVarName in context) {
        for (const info of context[contextVarName].infos) {
          const { key, valueRange, expressionRange } = info;

          const value = source.slice(...valueRange);

          // Create getter
          let toAdd = createGetter(key, value);

          // Add setter if needed
          if (!info.readonly) {
            toAdd += createSetter(key, value);
          }

          source.overwrite(...expressionRange, toAdd);
        }
      }

      const code = await format(source.toString(), {
        parser: "typescript",
        filepath: filename,
      });

      if (filename?.endsWith("QTabs.svelte")) {
        console.log(code);
      }

      return {
        code,
        map: source.generateMap(),
        file: filename,
      };
    },
  };
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
  let varName;

  if (node.type !== "ExportNamedDeclaration" || !node.declaration) {
    return;
  }

  const exported = node.declaration;

  if (exported.type !== "VariableDeclaration" || exported.declarations.length !== 1) {
    return;
  }

  const decl = exported.declarations[0];

  if (decl.type !== "VariableDeclarator" || decl.id.type !== "Identifier") {
    return;
  }

  const { init, id } = decl;

  if (init?.type !== "CallExpression") {
    return;
  }

  const { callee, typeArguments } = init;

  if (
    callee.type !== "Identifier" ||
    callee.name !== "QContext" ||
    !typeArguments ||
    typeArguments.params.length !== 1
  ) {
    return;
  }

  context[id.name] = {
    members: [],
    infos: [],
  };

  const typeArg = typeArguments.params[0];

  /** @type {TSESTree.TypeElement[]} */
  let typeMembers = [];
  /** @type {string} */
  let typeName;

  if (typeArg.type === "TSTypeReference" && typeArg.typeName.type === "Identifier") {
    typeName = typeArg.typeName.name;

    if (!typeName.endsWith("Context")) {
      console.warn(`Invalid context type: ${typeName}. The context type must end with "Context".`);
      return;
    }

    const foundInterface = /** @type {TSESTree.TSInterfaceDeclaration} */ (
      contextInterfaces.find(
        (node) => /** @type {TSESTree.TSInterfaceDeclaration} */ (node).id.name === typeName
      )
    );

    if (!foundInterface) {
      console.warn(
        `Context type ${typeName} is not defined in the file. Please define it as a TSInterfaceDeclaration.`
      );
      return;
    }

    typeMembers = foundInterface.body.body;
  } else if (typeArg.type === "TSTypeLiteral") {
    typeMembers = typeArg.members;
  }

  typeMembers.forEach((member) => {
    if (member.type !== "TSPropertySignature") {
      console.warn(
        `Invalid member type: ${member.type} for ${typeName || "defined"} context. The context members must be TSPropertySignature.`
      );
      return;
    }

    const { key, readonly } = member;

    if (key.type !== "Identifier") {
      console.warn(
        `Invalid key type: ${key.type} for ${typeName || "defined"} context. The context members must be identifiers.`
      );
      return;
    }

    context[id.name].members.push({ key: key.name, readonly });
  });

  return varName;
}

/**
 *
 * @param {TSESTree.ProgramStatement} node
 * @param {string} contextVarName
 */
function handleContextSetting(node, contextVarName) {
  if (
    !contextVarName ||
    !context[contextVarName].members.length ||
    node.type !== "ExpressionStatement"
  ) {
    return;
  }

  const { expression } = node;

  if (expression.type !== "CallExpression" || expression.callee.type !== "MemberExpression") {
    return;
  }

  const { object, property } = expression.callee;

  if (object.type !== "Identifier" || object.name !== contextVarName) {
    return;
  }

  if (property.type !== "Identifier") {
    return;
  }

  if (expression.arguments.length !== 1) {
    console.warn(
      `Invalid context setting: ${property.name}. The context setting must have exactly one argument.`
    );
    return;
  }

  const argument = expression.arguments[0];

  if (argument.type !== "ObjectExpression") {
    console.warn(
      `Invalid context setting: ${property.name}. The context setting must be an object.`
    );
    return;
  }

  const { properties } = argument;

  if (properties.length !== context[contextVarName].members.length) {
    console.warn(
      `Invalid context setting: ${property.name}. The context setting must have exactly ${context[contextVarName].members.length} properties.`
    );
    return;
  }

  for (const prop of properties) {
    if (prop.type !== "Property") {
      console.warn(
        `Invalid context setting property: ${prop.type}. The context setting properties must be Property nodes.`
      );
      return;
    }

    const { key, value } = prop;

    if (key.type !== "Identifier") {
      console.warn(
        `Invalid context setting key: ${key.type}. The context setting keys must be identifiers.`
      );
      return;
    }

    const member = context[contextVarName].members.find((m) => m.key === key.name);

    if (!member) {
      console.warn(`Context setting property ${key.name} is not defined in the context interface.`);
      return;
    }

    context[contextVarName].infos.push({
      readonly: member.readonly,
      key: member.key,
      valueRange: value.range,
      expressionRange: prop.range,
    });
  }
}

/**
 * Creates a getter for the context.
 * @param {string} key - The key of the context.
 * @param {string} value - The value of the context.
 * @returns {string} The getter function as a string.
 */
function createGetter(key, value) {
  return `get ${key}() {
    return ${value};
  }`;
}

/**
 * Creates a setter for the context.
 * @param {string} key - The key of the context.
 * @param {string} value - The value of the context.
 * @returns {string} The setter function as a string.
 */
function createSetter(key, value) {
  return `,\nset ${key}(newValue) {
    ${value} = newValue;
  }`;
}
