export interface SyntaxNode {
  type: string;
  [key: string]: unknown;
}

interface Scope {
  parent?: Scope;
  bindings: Map<string, Binding>;
  isFunction?: boolean;
}

interface Binding {
  node: SyntaxNode;
  expression?: SyntaxNode;
  isMutable: boolean;
  isWritten?: boolean;
}

type Primitive = string | number | boolean | null | undefined;

interface Values {
  values: Primitive[];
  complete: boolean;
}

export interface FiniteIconValues {
  values: Set<string>;
  complete: boolean;
}

interface SyntaxIndex {
  scopes: WeakMap<SyntaxNode, Scope>;
  parents: WeakMap<SyntaxNode, SyntaxNode>;
  nodes: SyntaxNode[];
  globalScope: Scope;
}

interface EvaluationState {
  index: SyntaxIndex;
  active: Set<SyntaxNode>;
}

type ReadValues = (node: unknown) => Values;

const MAX_DEPTH = 24;
const MAX_VALUES = 128;
export const FUNCTION_TYPES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);
const SCOPE_TYPES = new Set([
  "Fragment",
  "BlockStatement",
  "EachBlock",
  "SnippetBlock",
  "CatchClause",
  "ForStatement",
  "ForOfStatement",
  "ForInStatement",
  "SwitchStatement",
  "ClassDeclaration",
  "ClassExpression",
  "StaticBlock",
  "TSModuleBlock",
]);
export const TYPE_WRAPPERS = new Set([
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSNonNullExpression",
  "ChainExpression",
]);

function readNode(value: unknown): SyntaxNode | undefined {
  if (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof value.type === "string"
  ) {
    return value as SyntaxNode;
  }
}

function readNodes(value: unknown): SyntaxNode[] {
  return Array.isArray(value) ? value.flatMap((item) => readNode(item) ?? []) : [];
}

export function readSyntaxChildren(node: SyntaxNode) {
  return Object.entries(node).flatMap(([key, value]) => {
    if (
      ["loc", "metadata", "parent", "comments", "leadingComments", "trailingComments"].includes(key)
    ) {
      return [];
    }

    return readNode(value) ?? readNodes(value);
  });
}

function createValues(values: Primitive[] = [], isComplete = true): Values {
  const unique = [...new Set(values)];

  return {
    values: unique.slice(0, MAX_VALUES),
    complete: isComplete && unique.length <= MAX_VALUES,
  };
}

function mergeValues(results: Values[]) {
  return createValues(
    results.flatMap((result) => result.values),
    results.every((result) => result.complete)
  );
}

function findBinding(name: unknown, scope: Scope | undefined): Binding | undefined {
  for (let current = scope; current; current = current.parent) {
    const binding = current.bindings.get(String(name));

    if (binding) {
      return binding;
    }
  }
}

function bindPattern(
  pattern: SyntaxNode | undefined,
  scope: Scope,
  expression?: SyntaxNode,
  isMutable = false
) {
  if (!pattern) {
    return;
  }

  if (pattern.type === "Identifier") {
    scope.bindings.set(String(pattern.name), { node: pattern, expression, isMutable });
    return;
  }

  if (pattern.type === "AssignmentPattern" || pattern.type === "RestElement") {
    bindPattern(readNode(pattern.left ?? pattern.argument), scope, readNode(pattern.right), true);
    return;
  }

  for (const child of readSyntaxChildren(pattern)) {
    const target = child.type === "Property" ? readNode(child.value) : child;

    if (target && !target.type.startsWith("TS")) {
      bindPattern(target, scope);
    }
  }
}

function bindVariable(node: SyntaxNode, scope: Scope, parent?: SyntaxNode) {
  let declarationScope = scope;

  while (parent?.kind === "var" && declarationScope.parent && !declarationScope.isFunction) {
    declarationScope = declarationScope.parent;
  }

  bindPattern(readNode(node.id), declarationScope, readNode(node.init), parent?.kind !== "const");
}

function bindNodeScope(node: SyntaxNode, scope: Scope, outerScope: Scope, parent?: SyntaxNode) {
  if (FUNCTION_TYPES.has(node.type)) {
    if (node.type === "FunctionExpression") {
      bindPattern(readNode(node.id), scope, node);
    }

    readNodes(node.params).forEach((parameter) => bindPattern(parameter, scope));
    return;
  }

  switch (node.type) {
    case "ClassExpression":
      bindPattern(readNode(node.id), scope);
      return;
    case "SnippetBlock":
      bindPattern(readNode(node.expression), outerScope);
      readNodes(node.parameters).forEach((parameter) => bindPattern(parameter, scope));
      return;
    case "EachBlock":
      bindPattern(readNode(node.context), scope);

      if (typeof node.index === "string") {
        bindPattern({ type: "Identifier", name: node.index }, scope);
      }

      return;
    case "CatchClause":
      bindPattern(readNode(node.param), scope);
      return;
    case "VariableDeclarator":
      bindVariable(node, scope, parent);
      return;
    case "ImportDeclaration":
      if (node.importKind !== "type") {
        readNodes(node.specifiers)
          .filter((specifier) => specifier.importKind !== "type")
          .forEach((specifier) => bindPattern(readNode(specifier.local), scope));
      }
  }
}

function visitAwaitBranches(node: SyntaxNode, scope: Scope, index: SyntaxIndex) {
  index.scopes.set(node, scope);
  visitSyntax(readNode(node.expression), scope, index, node);
  visitSyntax(readNode(node.pending), scope, index, node);

  for (const [branchName, parameterName] of [
    ["then", "value"],
    ["catch", "error"],
  ]) {
    const branchScope: Scope = { parent: scope, bindings: new Map() };
    bindPattern(readNode(node[parameterName]), branchScope);
    visitSyntax(readNode(node[branchName]), branchScope, index, node);
  }
}

function visitSyntax(
  node: SyntaxNode | undefined,
  scope: Scope,
  index: SyntaxIndex,
  parent?: SyntaxNode
) {
  if (!node) {
    return;
  }

  index.nodes.push(node);

  if (parent) {
    index.parents.set(node, parent);
  }

  if (node.type === "AwaitBlock") {
    visitAwaitBranches(node, scope, index);
    return;
  }

  if (node.type === "FunctionDeclaration" || node.type === "ClassDeclaration") {
    bindPattern(readNode(node.id), scope, node.type === "FunctionDeclaration" ? node : undefined);
  }

  let current = scope;

  if (FUNCTION_TYPES.has(node.type) || SCOPE_TYPES.has(node.type)) {
    current = { parent: scope, bindings: new Map(), isFunction: FUNCTION_TYPES.has(node.type) };
  }

  index.scopes.set(node, current);
  bindNodeScope(node, current, scope, parent);

  for (const child of readSyntaxChildren(node)) {
    const isOutsideEachScope =
      node.type === "EachBlock" && (child === node.expression || child === node.fallback);
    visitSyntax(child, isOutsideEachScope ? scope : current, index, node);
  }
}

function markTargetWritten(target: SyntaxNode | undefined, index: SyntaxIndex) {
  if (target?.type === "Identifier") {
    const binding = findBinding(target.name, index.scopes.get(target));

    if (binding) {
      binding.isWritten = true;
    }

    return;
  }

  if (
    !target ||
    !["ArrayPattern", "ObjectPattern", "AssignmentPattern", "RestElement", "Property"].includes(
      target.type
    )
  ) {
    return;
  }

  if (target.type === "AssignmentPattern") {
    markTargetWritten(readNode(target.left), index);
    return;
  }

  const children =
    target.type === "Property" ? [readNode(target.value)] : readSyntaxChildren(target);
  children.forEach((child) => markTargetWritten(child, index));
}

function createSyntaxIndex(root: unknown): SyntaxIndex {
  const index: SyntaxIndex = {
    scopes: new WeakMap(),
    parents: new WeakMap(),
    nodes: [],
    globalScope: { bindings: new Map(), isFunction: true },
  };
  const syntax = readNode(root);

  if (syntax?.type === "Root") {
    visitSyntax(readNode(readNode(syntax.module)?.content), index.globalScope, index);
    const instanceScope: Scope = {
      parent: index.globalScope,
      bindings: new Map(),
      isFunction: true,
    };
    visitSyntax(readNode(readNode(syntax.instance)?.content), instanceScope, index);
    visitSyntax(readNode(syntax.fragment), instanceScope, index);
  } else {
    visitSyntax(syntax, index.globalScope, index);
  }

  for (const node of index.nodes) {
    if (["AssignmentExpression", "UpdateExpression", "BindDirective"].includes(node.type)) {
      markTargetWritten(readNode(node.left ?? node.argument ?? node.expression), index);
    }
  }

  return index;
}

function evaluateIdentifier(
  node: SyntaxNode,
  read: ReadValues,
  scope: Scope,
  active: Set<SyntaxNode>
) {
  const binding = findBinding(node.name, scope);

  if (!binding && node.name === "undefined") {
    return createValues([undefined]);
  }

  if (!binding?.expression) {
    return createValues([], false);
  }

  active.add(node);
  const result = read(binding.expression);
  active.delete(node);

  return createValues(result.values, result.complete && !binding.isMutable && !binding.isWritten);
}

function evaluateTemplate(node: SyntaxNode, read: ReadValues) {
  const quasis = readNodes(node.quasis).map(
    (quasi) => quasi.value as { cooked?: string; raw: string }
  );
  let result = createValues([quasis[0].cooked ?? quasis[0].raw]);
  readNodes(node.expressions).forEach((expression, index) => {
    result = combineValues(
      result,
      read(expression),
      (left, right) => String(left) + right + (quasis[index + 1].cooked ?? quasis[index + 1].raw)
    );
  });

  return result;
}

function evaluateCall(
  node: SyntaxNode,
  read: ReadValues,
  scope: Scope,
  depth: number,
  state: EvaluationState
) {
  const callee = readNode(node.callee);
  const argumentNodes = readNodes(node.arguments);
  const binding = callee?.type === "Identifier" ? findBinding(callee.name, scope) : undefined;

  if (!binding && callee?.name === "$derived") {
    return read(argumentNodes[0]);
  }

  if (!binding && callee?.name === "$state") {
    return createValues(read(argumentNodes[0]).values, false);
  }

  const owner = readNode(callee?.object);
  const isDerivedBy =
    owner?.name === "$derived" &&
    !findBinding(owner.name, scope) &&
    readNode(callee?.property)?.name === "by";
  const fn = isDerivedBy ? argumentNodes[0] : binding?.expression;

  if (!fn || !FUNCTION_TYPES.has(fn.type)) {
    return createValues([], false);
  }

  const result = evaluateFunction(fn, scope, depth + 1, state);

  return createValues(result.values, result.complete && !binding?.isMutable && !binding?.isWritten);
}

function evaluate(
  node: SyntaxNode | undefined,
  scope: Scope,
  depth: number,
  state: EvaluationState
): Values {
  if (!node || depth >= MAX_DEPTH || state.active.has(node)) {
    return createValues([], false);
  }

  const current = state.index.scopes.get(node) ?? scope;
  const read = (value: unknown) => evaluate(readNode(value), current, depth + 1, state);

  if (TYPE_WRAPPERS.has(node.type) || node.type === "ExpressionTag") {
    return read(node.expression);
  }

  switch (node.type) {
    case "Text":
      return createValues([String(node.data)]);
    case "Literal":
      return ["string", "number", "boolean"].includes(typeof node.value) || node.value === null
        ? createValues([node.value as Primitive])
        : createValues([], false);
    case "ConditionalExpression":
      return mergeValues([read(node.consequent), read(node.alternate)]);
    case "LogicalExpression":
      return mergeValues([read(node.left), read(node.right)]);
    case "Identifier":
      return evaluateIdentifier(node, read, current, state.active);
    case "BinaryExpression":
      return node.operator === "+"
        ? combineValues(read(node.left), read(node.right), addValues)
        : createValues([], false);
    case "TemplateLiteral":
      return evaluateTemplate(node, read);
    case "CallExpression":
      return evaluateCall(node, read, current, depth, state);
    default:
      return createValues([], false);
  }
}

function collectFunctionReturns(
  node: SyntaxNode,
  scope: Scope,
  depth: number,
  state: EvaluationState,
  results: Values[]
): boolean {
  if (node.type === "ReturnStatement") {
    results.push(evaluate(readNode(node.argument), scope, depth, state));
    return true;
  }

  if (node.type === "VariableDeclaration" || node.type === "VariableDeclarator") {
    return true;
  }

  if (node.type !== "BlockStatement" && node.type !== "IfStatement") {
    return false;
  }

  const children =
    node.type === "IfStatement"
      ? readNodes([node.consequent, node.alternate])
      : readNodes(node.body);
  let isComplete = true;

  for (const child of children) {
    isComplete = collectFunctionReturns(child, scope, depth, state, results) && isComplete;
  }

  return isComplete;
}

function evaluateFunction(
  fn: SyntaxNode,
  scope: Scope,
  depth: number,
  state: EvaluationState
): Values {
  if (state.active.has(fn) || depth >= MAX_DEPTH) {
    return createValues([], false);
  }

  state.active.add(fn);
  const body = readNode(fn.body);
  let result: Values;

  if (body?.type !== "BlockStatement") {
    result = evaluate(body, scope, depth, state);
  } else {
    const results: Values[] = [];
    const isComplete = collectFunctionReturns(body, scope, depth, state, results);
    const combined = mergeValues(results);
    result = createValues(combined.values, isComplete && combined.complete && results.length > 0);
  }

  state.active.delete(fn);
  return result;
}

/** Unknown expressions remain incomplete; this never executes application code. */
export function createFiniteIconEvaluator(root: unknown) {
  const index = createSyntaxIndex(root);

  return {
    nodes: index.nodes,
    parents: index.parents,

    getBinding(name: string, contextNode: unknown) {
      const node = readNode(contextNode);

      return findBinding(name, node ? index.scopes.get(node) : undefined)?.node;
    },

    getValues(expression: unknown, contextNode?: unknown): FiniteIconValues {
      const node = readNode(expression);
      const context = readNode(contextNode) ?? node;
      const scope = context ? (index.scopes.get(context) ?? index.globalScope) : index.globalScope;
      const result = evaluate(node, scope, 0, { index, active: new Set() });

      return {
        values: new Set(
          result.values.filter((value): value is string => typeof value === "string")
        ),
        complete: result.complete,
      };
    },
  };
}

function addValues(left: Primitive, right: Primitive) {
  if (typeof left === "string" || typeof right === "string") {
    return String(left) + String(right);
  }

  return Number(left) + Number(right);
}

function combineValues(
  left: Values,
  right: Values,
  combine: (left: Primitive, right: Primitive) => Primitive
): Values {
  if (left.values.length * right.values.length > MAX_VALUES) {
    return createValues([], false);
  }

  return createValues(
    left.values.flatMap((prefix) => right.values.map((suffix) => combine(prefix, suffix))),
    left.complete && right.complete
  );
}
