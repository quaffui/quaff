import { parse, preprocess, type AST } from "svelte/compiler";

interface SyntaxNode {
  type: string;
  [key: string]: unknown;
}

interface Scope {
  parent?: Scope;
  bindings: Map<string, SyntaxNode>;
  functionScope: boolean;
}

const FUNCTION_SCOPES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);
const BLOCK_SCOPES = new Set([
  "Fragment",
  "BlockStatement",
  "CatchClause",
  "ForStatement",
  "ForInStatement",
  "ForOfStatement",
  "SwitchStatement",
  "StaticBlock",
  "TSModuleBlock",
  "EachBlock",
  "SnippetBlock",
  "ClassDeclaration",
  "ClassExpression",
]);
const TYPE_WRAPPERS = new Set(["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression"]);

interface SyntaxIndex {
  parents: Map<SyntaxNode, SyntaxNode | undefined>;
  scopes: Map<SyntaxNode, Scope>;
  namespaces: Set<SyntaxNode>;
  aliases: Map<SyntaxNode, SyntaxNode>;
}

/** Returns true when all namespace uses are understood; false means all component CSS is needed. */
export async function canCollectNamespaceComponents(
  code: string,
  candidates: Set<string>,
  layout?: AST.Root
): Promise<boolean> {
  const syntax = layout ?? (await parseNamespaceSource(code));

  if (!syntax) {
    // Keep CSS while a Quaff import is being edited, without expanding unrelated imports.
    return !code.includes("@quaffui/quaff");
  }

  const index = createSyntaxIndex(syntax);
  const { namespaces, aliases } = index;
  resolveNamespaceAliases(namespaces, aliases, index.scopes);

  for (const node of index.scopes.keys()) {
    const binding = node.type === "Identifier" ? resolveBinding(node, index.scopes) : undefined;

    if (!binding || !namespaces.has(binding)) {
      continue;
    }

    const { reference, parent } = getUnwrappedReference(node, index.parents);

    if (!parent || !isReference(reference, parent, index.parents)) {
      continue;
    }

    const names = getReferencedNames(reference, parent, index);

    if (!names) {
      return false;
    }

    names.forEach((name) => candidates.add(name));
  }

  return true;
}

function resolveBinding(node: SyntaxNode, scopes: SyntaxIndex["scopes"]) {
  let scope = scopes.get(node);

  while (scope) {
    const binding = scope.bindings.get(node.name as string);

    if (binding) {
      return binding;
    }

    scope = scope.parent;
  }
}

function indexNode(
  index: SyntaxIndex,
  node: SyntaxNode,
  parent: SyntaxNode | undefined,
  scope: Scope
) {
  index.parents.set(node, parent);
  index.scopes.set(node, scope);
  const isNamespaceImport =
    node.type === "ImportNamespaceSpecifier" &&
    parent?.type === "ImportDeclaration" &&
    parent.importKind !== "type" &&
    (parent.source as SyntaxNode).value === "@quaffui/quaff";

  if (isNamespaceImport) {
    index.namespaces.add(node.local as SyntaxNode);
  }

  const alias = getImmutableAlias(node, parent);

  if (alias) {
    index.aliases.set(node, alias);
  }
}

function getImmutableAlias(node: SyntaxNode, parent: SyntaxNode | undefined) {
  if (
    node.type !== "VariableDeclarator" ||
    parent?.kind !== "const" ||
    (node.id as SyntaxNode).type !== "Identifier"
  ) {
    return;
  }

  let source = node.init as SyntaxNode | undefined;

  while (source && TYPE_WRAPPERS.has(source.type)) {
    source = source.expression as SyntaxNode;
  }

  return source?.type === "Identifier" ? source : undefined;
}

function resolveNamespaceAliases(
  namespaces: Set<SyntaxNode>,
  aliases: Map<SyntaxNode, SyntaxNode>,
  scopes: SyntaxIndex["scopes"]
) {
  let previousSize: number;

  do {
    previousSize = namespaces.size;
    addResolvedAliases(namespaces, aliases, scopes);
  } while (namespaces.size !== previousSize);
}

function addResolvedAliases(
  namespaces: Set<SyntaxNode>,
  aliases: Map<SyntaxNode, SyntaxNode>,
  scopes: SyntaxIndex["scopes"]
) {
  for (const [node, source] of aliases) {
    const binding = resolveBinding(source, scopes);

    if (binding && namespaces.has(binding)) {
      namespaces.add(node.id as SyntaxNode);
    }
  }
}

function getUnwrappedReference(node: SyntaxNode, parents: SyntaxIndex["parents"]) {
  let reference = node;
  let parent = parents.get(reference);

  while (parent && TYPE_WRAPPERS.has(parent.type)) {
    reference = parent;
    parent = parents.get(reference);
  }

  return { reference, parent };
}

function getReferencedNames(
  reference: SyntaxNode,
  parent: SyntaxNode,
  index: SyntaxIndex
): string[] | undefined {
  if (parent.type === "MemberExpression" && parent.object === reference) {
    const name = getStaticPropertyName(parent.property as SyntaxNode, !!parent.computed);

    return name === undefined ? undefined : [name];
  }

  if (parent.type === "VariableDeclarator" && parent.init === reference) {
    if (index.aliases.has(parent)) {
      const declaration = index.parents.get(parent);
      const isExported =
        declaration && index.parents.get(declaration)?.type === "ExportNamedDeclaration";

      return isExported ? undefined : [];
    }

    return getDestructuredNames(parent.id as SyntaxNode);
  }

  if (parent.type === "CallExpression") {
    return getReflectPropertyName(parent, reference, index.scopes);
  }
}

function getDestructuredNames(pattern: SyntaxNode) {
  if (pattern.type !== "ObjectPattern") {
    return;
  }

  const names: string[] = [];

  for (const property of pattern.properties as SyntaxNode[]) {
    const name =
      property.type === "Property"
        ? getStaticPropertyName(property.key as SyntaxNode, !!property.computed)
        : undefined;

    if (name === undefined) {
      return;
    }

    names.push(name);
  }

  return names;
}

function getReflectPropertyName(
  call: SyntaxNode,
  reference: SyntaxNode,
  scopes: SyntaxIndex["scopes"]
) {
  const callee = call.callee as SyntaxNode;
  const args = call.arguments as SyntaxNode[];

  if (callee.type !== "MemberExpression" || args[0] !== reference) {
    return;
  }

  const receiver = callee.object as SyntaxNode;
  const isGlobalReflect = receiver.name === "Reflect" && !resolveBinding(receiver, scopes);
  const isGetMethod =
    getStaticPropertyName(callee.property as SyntaxNode, !!callee.computed) === "get";

  if (!isGlobalReflect || !isGetMethod || !args[1]) {
    return;
  }

  const name = getStaticPropertyName(args[1], true);

  return name === undefined ? undefined : [name];
}

function getStaticPropertyName(node: SyntaxNode, computed: boolean): string | undefined {
  if (!computed && node.type === "Identifier") {
    return node.name as string;
  }

  if (node.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }

  if (node.type === "TemplateLiteral" && !(node.expressions as unknown[]).length) {
    return ((node.quasis as SyntaxNode[])[0].value as { cooked: string }).cooked;
  }
}

function isReference(
  node: SyntaxNode,
  parent: SyntaxNode,
  parents: Map<SyntaxNode, SyntaxNode | undefined>
) {
  if (
    parent.type.startsWith("Import") ||
    (parent.type === "VariableDeclarator" && parent.id === node) ||
    (parent.type === "MemberExpression" && parent.property === node && !parent.computed) ||
    (["Property", "MethodDefinition", "PropertyDefinition"].includes(parent.type) &&
      parent.key === node &&
      !parent.computed &&
      !parent.shorthand) ||
    (parent.type === "ExportSpecifier" && parent.exported === node && parent.local !== node)
  ) {
    return false;
  }

  let ancestor: SyntaxNode | undefined = parent;

  while (ancestor) {
    if (
      ancestor.exportKind === "type" ||
      [
        "TSTypeAnnotation",
        "TSTypeQuery",
        "TSTypeReference",
        "TSTypeAliasDeclaration",
        "TSInterfaceDeclaration",
      ].includes(ancestor.type)
    ) {
      return false;
    }

    ancestor = parents.get(ancestor);
  }

  return true;
}

function createSyntaxIndex(syntax: AST.Root): SyntaxIndex {
  const index: SyntaxIndex = {
    parents: new Map(),
    scopes: new Map(),
    namespaces: new Set(),
    aliases: new Map(),
  };

  function bindPattern(pattern: SyntaxNode | undefined, scope: Scope) {
    if (!pattern) {
      return;
    }

    if (pattern.type === "Identifier") {
      scope.bindings.set(pattern.name as string, pattern);
    } else if (pattern.type === "ObjectPattern") {
      for (const property of pattern.properties as SyntaxNode[]) {
        bindPattern((property.value ?? property.argument) as SyntaxNode, scope);
      }
    } else if (pattern.type === "ArrayPattern") {
      (pattern.elements as SyntaxNode[]).forEach((element) => bindPattern(element, scope));
    } else {
      bindPattern(
        (pattern.left ?? pattern.argument ?? pattern.parameter) as SyntaxNode | undefined,
        scope
      );
    }
  }

  function visitNode(value: unknown, outer: Scope, parent?: SyntaxNode) {
    if (!value || typeof value !== "object") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((child) => visitNode(child, outer, parent));
      return;
    }

    const node = value as SyntaxNode;

    if (typeof node.type !== "string") {
      return;
    }

    const isFunction = FUNCTION_SCOPES.has(node.type);
    const functionScope =
      isFunction ||
      ["StaticBlock", "TSModuleBlock"].includes(node.type) ||
      (node.type === "BlockStatement" && parent?.body === node && FUNCTION_SCOPES.has(parent.type));
    const scope =
      isFunction || BLOCK_SCOPES.has(node.type) ? createScope(outer, functionScope) : outer;
    indexNode(index, node, parent, scope);

    if (node.type === "VariableDeclarator") {
      const owner = resolveVariableScope(scope, parent);
      bindPattern(node.id as SyntaxNode, owner);
    } else if (node.type.startsWith("Import") && node.local) {
      bindPattern(node.local as SyntaxNode, scope);
    } else if (isFunction) {
      bindPattern(node.id as SyntaxNode, node.type === "FunctionDeclaration" ? outer : scope);
      (node.params as SyntaxNode[]).forEach((parameter) => bindPattern(parameter, scope));
    } else if (node.type === "CatchClause") {
      bindPattern(node.param as SyntaxNode, scope);
    } else if (node.type.startsWith("Class")) {
      bindPattern(node.id as SyntaxNode, node.type === "ClassDeclaration" ? outer : scope);
    } else if (node.type === "EachBlock") {
      bindPattern(node.context as SyntaxNode, scope);

      if (node.index) {
        scope.bindings.set(node.index as string, node);
      }
    } else if (node.type === "SnippetBlock") {
      bindPattern(node.expression as SyntaxNode, outer);
      (node.parameters as SyntaxNode[]).forEach((parameter) => bindPattern(parameter, scope));
    }

    const instance = node.type === "Root" ? createScope(scope, true) : scope;
    const branches = node.type === "AwaitBlock" ? new Map<string, Scope>() : undefined;

    if (branches) {
      for (const [branch, binding] of [
        ["then", "value"],
        ["catch", "error"],
      ]) {
        const branchScope = createScope(scope);
        bindPattern(node[binding] as SyntaxNode, branchScope);
        branches.set(branch, branchScope);
        branches.set(binding, branchScope);
      }
    }

    for (const [key, child] of Object.entries(node)) {
      const childScope = getChildScope(node, key, scope, outer, instance, branches);
      visitNode(child, childScope, node);
    }
  }

  visitNode(syntax, createScope(undefined, true));
  return index;
}

function resolveVariableScope(scope: Scope, parent: SyntaxNode | undefined) {
  if (parent?.kind !== "var") {
    return scope;
  }

  let owner = scope;

  while (owner.parent && !owner.functionScope) {
    owner = owner.parent;
  }

  return owner;
}

function getChildScope(
  node: SyntaxNode,
  key: string,
  scope: Scope,
  outer: Scope,
  instance: Scope,
  branches: Map<string, Scope> | undefined
) {
  if (node.type === "Root" && ["instance", "fragment"].includes(key)) {
    return instance;
  }

  const isEachInput = node.type === "EachBlock" && ["expression", "fallback"].includes(key);
  const isSwitchInput = node.type === "SwitchStatement" && key === "discriminant";

  if (isEachInput || isSwitchInput) {
    return outer;
  }

  return branches?.get(key) ?? scope;
}

function createScope(parent?: Scope, functionScope = false): Scope {
  return { parent, bindings: new Map(), functionScope };
}

async function parseNamespaceSource(code: string) {
  try {
    // Script text inside a JS string must not terminate the synthetic Svelte script.
    const script = code
      .replace(/^#!/, "//")
      .replace(/<\/script/gi, (closing) => closing.replace("/", "\\/"));
    return parse(`<script lang="ts">\n${script}\n</script>`, { modern: true });
  } catch {
    try {
      const source = await preprocess(code, {
        style: ({ content }) => ({ code: content.replace(/[^\r\n]/g, " ") }),
      });
      return parse(source.code, { modern: true });
    } catch {
      return undefined;
    }
  }
}
