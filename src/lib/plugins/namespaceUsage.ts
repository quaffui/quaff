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

interface NodeEntry {
  node: SyntaxNode;
  parent?: SyntaxNode;
  scope: Scope;
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

/** Returns true when all namespace uses are understood; false means all component CSS is needed. */
export async function tryCollectNamespaceComponents(
  code: string,
  candidates: Set<string>,
  layout?: AST.Root
): Promise<boolean> {
  const syntax = layout ?? (await parseNamespaceSource(code));

  if (!syntax) {
    // Keep CSS while a Quaff import is being edited, without expanding unrelated imports.
    return !code.includes("@quaffui/quaff");
  }

  const entries = collectNodes(syntax);
  const parents = new Map(entries.map(({ node, parent }) => [node, parent]));
  const scopes = new Map(entries.map(({ node, scope }) => [node, scope]));
  const namespaces = new Set<SyntaxNode>();

  function resolve(node: SyntaxNode) {
    let scope = scopes.get(node);

    while (scope) {
      const binding = scope.bindings.get(node.name as string);

      if (binding) {
        return binding;
      }

      scope = scope.parent;
    }
  }

  for (const { node } of entries) {
    if (
      node.type === "ImportDeclaration" &&
      node.importKind !== "type" &&
      (node.source as SyntaxNode).value === "@quaffui/quaff"
    ) {
      for (const specifier of node.specifiers as SyntaxNode[]) {
        if (specifier.type === "ImportNamespaceSpecifier") {
          namespaces.add(specifier.local as SyntaxNode);
        }
      }
    }
  }

  // Follow simple immutable aliases, without attempting general expression/dataflow analysis.
  const aliases = new Map<SyntaxNode, SyntaxNode>();

  for (const { node, parent } of entries) {
    if (
      node.type !== "VariableDeclarator" ||
      parent?.kind !== "const" ||
      (node.id as SyntaxNode).type !== "Identifier"
    ) {
      continue;
    }

    let source = node.init as SyntaxNode | undefined;

    while (source && TYPE_WRAPPERS.has(source.type)) {
      source = source.expression as SyntaxNode;
    }

    if (source?.type === "Identifier") {
      aliases.set(node, source);
    }
  }

  let previousSize: number;

  do {
    previousSize = namespaces.size;

    for (const [node, source] of aliases) {
      const binding = resolve(source);

      if (binding && namespaces.has(binding)) {
        namespaces.add(node.id as SyntaxNode);
      }
    }
  } while (namespaces.size !== previousSize);

  for (const { node } of entries) {
    const binding = node.type === "Identifier" && resolve(node);

    if (!binding || !namespaces.has(binding)) {
      continue;
    }

    let reference = node;
    let parent = parents.get(reference);

    while (parent && TYPE_WRAPPERS.has(parent.type)) {
      reference = parent;
      parent = parents.get(reference);
    }

    if (!parent || !isReference(reference, parent, parents)) {
      continue;
    }

    if (parent.type === "MemberExpression" && parent.object === reference) {
      const name = staticKey(parent.property as SyntaxNode, !!parent.computed);

      if (name !== undefined) {
        candidates.add(name);
        continue;
      }
    }

    if (parent.type === "VariableDeclarator" && parent.init === reference) {
      if (aliases.has(parent)) {
        const declaration = parents.get(parent);

        if (declaration && parents.get(declaration)?.type === "ExportNamedDeclaration") {
          return false;
        }

        continue;
      }

      const pattern = parent.id as SyntaxNode;

      if (pattern.type === "ObjectPattern") {
        const names = (pattern.properties as SyntaxNode[]).map((property) =>
          property.type === "Property"
            ? staticKey(property.key as SyntaxNode, !!property.computed)
            : undefined
        );

        if (names.every((name) => name !== undefined)) {
          names.forEach((name) => candidates.add(name));
          continue;
        }
      }
    }

    if (parent.type === "CallExpression") {
      const callee = parent.callee as SyntaxNode;
      const args = parent.arguments as SyntaxNode[];

      if (
        callee.type === "MemberExpression" &&
        (callee.object as SyntaxNode).name === "Reflect" &&
        !resolve(callee.object as SyntaxNode) &&
        staticKey(callee.property as SyntaxNode, !!callee.computed) === "get" &&
        args[0] === reference
      ) {
        const name = args[1] && staticKey(args[1], true);

        if (name !== undefined) {
          candidates.add(name);
          continue;
        }
      }
    }

    return false;
  }

  return true;
}

function staticKey(node: SyntaxNode, computed: boolean): string | undefined {
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

function collectNodes(syntax: AST.Root) {
  const entries: NodeEntry[] = [];

  function bind(pattern: SyntaxNode | undefined, scope: Scope) {
    if (!pattern) {
      return;
    }

    if (pattern.type === "Identifier") {
      scope.bindings.set(pattern.name as string, pattern);
    } else if (pattern.type === "ObjectPattern") {
      for (const property of pattern.properties as SyntaxNode[]) {
        bind((property.value ?? property.argument) as SyntaxNode, scope);
      }
    } else if (pattern.type === "ArrayPattern") {
      (pattern.elements as SyntaxNode[]).forEach((element) => bind(element, scope));
    } else {
      bind(
        (pattern.left ?? pattern.argument ?? pattern.parameter) as SyntaxNode | undefined,
        scope
      );
    }
  }

  function visit(value: unknown, outer: Scope, parent?: SyntaxNode) {
    if (!value || typeof value !== "object") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((child) => visit(child, outer, parent));
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
    entries.push({ node, parent, scope });

    if (node.type === "VariableDeclarator") {
      let owner = scope;

      if (parent?.kind === "var") {
        while (owner.parent && !owner.functionScope) {
          owner = owner.parent;
        }
      }

      bind(node.id as SyntaxNode, owner);
    } else if (node.type.startsWith("Import") && node.local) {
      bind(node.local as SyntaxNode, scope);
    } else if (isFunction) {
      bind(node.id as SyntaxNode, node.type === "FunctionDeclaration" ? outer : scope);
      (node.params as SyntaxNode[]).forEach((parameter) => bind(parameter, scope));
    } else if (node.type === "CatchClause") {
      bind(node.param as SyntaxNode, scope);
    } else if (node.type.startsWith("Class")) {
      bind(node.id as SyntaxNode, node.type === "ClassDeclaration" ? outer : scope);
    } else if (node.type === "EachBlock") {
      bind(node.context as SyntaxNode, scope);

      if (node.index) {
        scope.bindings.set(node.index as string, node);
      }
    } else if (node.type === "SnippetBlock") {
      bind(node.expression as SyntaxNode, outer);
      (node.parameters as SyntaxNode[]).forEach((parameter) => bind(parameter, scope));
    }

    const instance = node.type === "Root" ? createScope(scope, true) : scope;
    const branches = node.type === "AwaitBlock" ? new Map<string, Scope>() : undefined;

    if (branches) {
      for (const [branch, binding] of [
        ["then", "value"],
        ["catch", "error"],
      ]) {
        const branchScope = createScope(scope);
        bind(node[binding] as SyntaxNode, branchScope);
        branches.set(branch, branchScope);
        branches.set(binding, branchScope);
      }
    }

    for (const [key, child] of Object.entries(node)) {
      const childScope =
        node.type === "Root" && ["instance", "fragment"].includes(key)
          ? instance
          : (node.type === "EachBlock" && ["expression", "fallback"].includes(key)) ||
              (node.type === "SwitchStatement" && key === "discriminant")
            ? outer
            : (branches?.get(key) ?? scope);
      visit(child, childScope, node);
    }
  }

  visit(syntax, createScope(undefined, true));
  return entries;
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
