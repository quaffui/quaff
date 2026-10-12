import {
  COMPONENT_DEFINITIONS,
  UTILITY_COMPONENT_DEPENDENCIES,
  type ComponentName,
} from "../../../internal/componentRegistry.js";
import { parseSourceSyntax } from "../sourceSyntax.js";
import { collectCssIconUsage, ICON_FONT_PATTERN } from "./cssIconUsage.js";
import { addSymbolNames } from "./iconSymbolNames.js";
import {
  createFiniteIconEvaluator,
  FUNCTION_TYPES,
  readSyntaxChildren,
  TYPE_WRAPPERS,
  type FiniteIconValues,
  type SyntaxNode,
} from "./finiteIconValues.js";
import type { AST } from "svelte/compiler";

interface ImportTarget {
  component?: string;
  namespace?: "quaff" | "svelte";
  utility?: "Notify";
  isRenderer?: boolean;
}

export interface IconSourceUsage {
  names: Set<string>;
  components: Set<ComponentName>;
  unresolved: { expression: string; reason: string; line?: number }[];
  file?: string;
}

interface IconSourceOptions {
  isLibrary?: boolean;
  syntax?: AST.Root;
}

const PRIVATE_ICON_PROPS: Readonly<Record<string, readonly string[]>> = {
  QIconSnippet: ["icon", "defaultIcon"],
  QFabBase: ["icon"],
  QSliderBase: ["icon"],
};
const IMPORT_NAMESPACES: Readonly<Record<string, "quaff" | "svelte">> = {
  "@quaffui/quaff": "quaff",
  "#lib": "quaff",
  $lib: "quaff",
  "#components": "quaff",
  svelte: "svelte",
  "svelte/server": "svelte",
};
const ICON_CLASS_PATTERN =
  /^(?:q-icon(?:--(?:outlined|rounded|sharp))?|material-symbols-(?:outlined|rounded|sharp))$/;
const SCRIPT_WRAPPER_LENGTH = '<script lang="ts">\n'.length;
const PRIVATE_GLYPH_PATTERN = /[\uE000-\uF8FF]/;
const COMPONENTS_BY_CLASS = createComponentClassIndex();
const MAX_PROJECTION_DEPTH = 12;
const ARRAY_INDEX_PATTERN = /^(?:0|[1-9]\d*)$/;
const ARRAY_SELECTION_RESULTS: ReadonlyMap<string, "array" | "item"> = new Map([
  ["filter", "array"],
  ["find", "item"],
  ["slice", "array"],
  ["at", "item"],
]);

/** Collect icon consumers, leaving arbitrary runtime values to the explicit safelist. */
export async function collectIconSourceUsage(
  code: string,
  file = "source.svelte",
  options: IconSourceOptions = {}
): Promise<IconSourceUsage> {
  const usage: IconSourceUsage = { names: new Set(), components: new Set(), unresolved: [], file };

  if (/\.(?:css|scss)$/.test(file)) {
    collectCssIconUsage(code, usage, file.endsWith(".scss"));

    return usage;
  }

  if (file.endsWith(".json")) {
    return usage;
  }

  if (!/\.(?:svelte|html|[cm]?[jt]s)$/.test(file)) {
    usage.unresolved.push({
      expression: file,
      reason: "Safelist icons rendered by custom source preprocessors.",
    });

    return usage;
  }

  const syntax = options.syntax ?? (await parseSourceSyntax(code));

  if (!syntax) {
    throw new Error(`[quaff:fonts] Could not parse icon usage in ${file}.`);
  }

  new SourceIconCollector(code, file, syntax, usage, !!options.isLibrary).collect();

  return usage;
}

class SourceIconCollector {
  private readonly evaluator: ReturnType<typeof createFiniteIconEvaluator>;
  private readonly templateSources: WeakMap<SyntaxNode, SyntaxNode>;
  private readonly escapingExpressions: (SyntaxNode | undefined)[];
  private readonly escapedBindings = new WeakMap<SyntaxNode, boolean>();
  private readonly imports = new Map<unknown, ImportTarget>();
  private readonly iconClasses = new Set<string>();
  private readonly offset: number;

  constructor(
    private readonly source: string,
    file: string,
    root: AST.Root,
    private readonly usage: IconSourceUsage,
    private readonly isLibrary: boolean
  ) {
    this.evaluator = createFiniteIconEvaluator(root);
    this.templateSources = collectTemplateSources(this.evaluator.nodes);
    this.offset = /\.(?:svelte|html)$/.test(file) ? 0 : SCRIPT_WRAPPER_LENGTH;

    if (root.css) {
      this.collectStylesheet(root.css.content, root.css.attributes);
    }

    this.collectImportsAndStyles();
    this.escapingExpressions = this.evaluator.nodes.flatMap((node) => this.readNodeEscapes(node));
  }

  collect() {
    for (const node of this.evaluator.nodes) {
      this.collectNode(node);
    }
  }

  private collectNode(node: SyntaxNode) {
    if (node.type === "Component") {
      const component = this.getTarget(String(node.name), node)?.component;

      if (component) {
        this.collectComponent(node, component);
      } else if (!this.isKnownNonQuaffComponent(String(node.name), node)) {
        this.report(
          node,
          "Include potential components with include and safelist dynamically forwarded icons."
        );
      }
    } else if (node.type === "RegularElement") {
      this.collectRawElement(node);
    } else if (node.type === "CallExpression") {
      this.collectCall(node);
    } else if (node.type === "HtmlTag") {
      this.report(node, "Safelist icons supplied through raw HTML.");
    } else if (node.type === "SvelteComponent") {
      this.report(node, "Include dynamically rendered components and safelist their icon props.");
    }
  }

  private collectImportsAndStyles() {
    for (const node of this.evaluator.nodes) {
      if (node.type === "ImportDeclaration" && node.importKind !== "type") {
        this.collectImportDeclaration(node);
      }

      if (node.type !== "RegularElement" || node.name !== "style") {
        continue;
      }

      const children = (node.fragment as SyntaxNode).nodes as SyntaxNode[];

      if (!children.length) {
        continue;
      }

      this.collectStylesheet(
        { start: Number(children[0].start), end: Number(children.at(-1)?.end) },
        node.attributes as SyntaxNode[]
      );
    }
  }

  private collectStylesheet(content: { start: number; end: number }, attributes: SyntaxNode[]) {
    const attribute = attributes.find((attribute) => attribute.name === "lang");
    const language = attribute && readAttributeValues(attribute)[0]?.data;
    const isPreprocessed = !!language && language !== "css";
    const css = this.source.slice(content.start, content.end);
    collectCssIconUsage(css, this.usage, isPreprocessed).forEach((className) =>
      this.iconClasses.add(className)
    );
  }

  private collectImportDeclaration(node: SyntaxNode) {
    const source = String((node.source as SyntaxNode).value);

    for (const specifier of node.specifiers as SyntaxNode[]) {
      if (specifier.importKind === "type") {
        continue;
      }

      const target = readImportTarget(source, specifier, this.isLibrary);

      if (target) {
        this.imports.set(specifier.local, target);
      }
    }
  }

  private getTarget(name: string, context: SyntaxNode, depth = 0): ImportTarget | undefined {
    if (depth > 12) {
      return;
    }

    const [local, member] = name.split(".");
    const binding = this.evaluator.getBinding(local, context);
    const imported = this.imports.get(binding);

    if (imported) {
      return readNamespaceTarget(imported, member);
    }

    const declaration = binding && this.evaluator.parents.get(binding);

    if (
      declaration?.type === "VariableDeclarator" &&
      this.evaluator.parents.get(declaration)?.kind === "const"
    ) {
      const alias = readReference(declaration.init as SyntaxNode);

      if (alias) {
        return this.getTarget(member ? `${alias}.${member}` : alias, declaration, depth + 1);
      }
    }

    if (binding || member) {
      return;
    }

    if (isComponentName(local)) {
      return { component: local };
    }

    if (local === "Notify") {
      return { utility: "Notify" };
    }
  }

  private report(node: SyntaxNode, reason: string) {
    if (this.isLibrary) {
      return;
    }

    const start = Math.max(0, Number(node.start ?? 0) - this.offset);
    const end = Math.max(start, Number(node.end ?? start) - this.offset);
    this.usage.unresolved.push({
      expression: this.source.slice(start, end),
      reason,
      line: this.source.slice(0, start).split("\n").length,
    });
  }

  private projectValues(
    expression: SyntaxNode | undefined,
    context: SyntaxNode,
    path: readonly string[],
    depth = 0
  ): FiniteIconValues {
    if (!expression || depth > MAX_PROJECTION_DEPTH) {
      return { values: new Set(), complete: false };
    }

    const read = (child: SyntaxNode | undefined, nextPath = path) =>
      this.projectValues(child, child ?? context, nextPath, depth + 1);

    if (TYPE_WRAPPERS.has(expression.type)) {
      return read(expression.expression as SyntaxNode);
    }

    if (isNonFontExpression(expression)) {
      return { values: new Set(), complete: true };
    }

    if (expression.type === "Identifier") {
      return this.projectIdentifier(expression, context, path, depth);
    }

    if (["ConditionalExpression", "LogicalExpression"].includes(expression.type)) {
      const branches =
        expression.type === "ConditionalExpression"
          ? [expression.consequent, expression.alternate]
          : [expression.left, expression.right];

      return mergeIconValues(branches.map((branch) => read(branch as SyntaxNode)));
    }

    if (expression.type === "CallExpression") {
      return this.projectCall(expression, context, path, depth);
    }

    if (expression.type === "MemberExpression") {
      return this.projectMember(expression, context, path, depth);
    }

    if (!path.length) {
      return this.evaluator.getValues(expression, context);
    }

    if (expression.type === "ArrayExpression") {
      return this.projectArray(expression, context, path, depth);
    }

    if (expression.type === "ObjectExpression") {
      return this.projectObject(expression, context, path, depth);
    }

    return { values: new Set(), complete: false };
  }

  private projectArray(
    expression: SyntaxNode,
    context: SyntaxNode,
    path: readonly string[],
    depth: number
  ): FiniteIconValues {
    const [field, ...rest] = path;
    const elements = expression.elements as (SyntaxNode | null)[];
    const hasSpread = elements.some((element) => element?.type === "SpreadElement");
    const isIndex = ARRAY_INDEX_PATTERN.test(field);

    if (isIndex && !hasSpread) {
      const value = elements[Number(field)];

      return value
        ? this.projectValues(value, value, rest, depth + 1)
        : { values: new Set(), complete: false };
    }

    if (field !== "*" && !isIndex) {
      return { values: new Set(), complete: false };
    }

    const projectedValues = elements.flatMap(
      (element) => this.projectArrayElement(element, context, rest, depth) ?? []
    );

    return mergeIconValues(projectedValues, !isIndex);
  }

  private projectArrayElement(
    element: SyntaxNode | null,
    context: SyntaxNode,
    path: readonly string[],
    depth: number
  ): FiniteIconValues | undefined {
    if (!element) {
      return;
    }

    const isSpread = element.type === "SpreadElement";
    const value = isSpread ? (element.argument as SyntaxNode) : element;

    if (isSpread && !this.isArraySource(value, value ?? context, depth + 1)) {
      return { values: new Set(), complete: false };
    }

    return this.projectValues(value, value ?? context, isSpread ? ["*", ...path] : path, depth + 1);
  }

  private projectCall(
    expression: SyntaxNode,
    context: SyntaxNode,
    path: readonly string[],
    depth: number
  ): FiniteIconValues {
    const callee = expression.callee as SyntaxNode;
    const argumentNodes = expression.arguments as SyntaxNode[];

    if (this.isReactiveCall(callee, context)) {
      const value = argumentNodes[0];
      const result = this.projectValues(value, value ?? context, path, depth + 1);

      return { ...result, complete: result.complete && callee.name !== "$state" };
    }

    const selection = readArraySelection(expression);

    if (!selection || !this.isArraySource(selection.receiver, context, depth + 1)) {
      return path.length
        ? { values: new Set(), complete: false }
        : this.evaluator.getValues(expression, context);
    }

    const { isArrayResult, receiver } = selection;
    const sourcePath = isArrayResult ? ["*", ...path.slice(1)] : ["*", ...path];
    const result = this.projectValues(receiver, receiver ?? context, sourcePath, depth + 1);

    // Select from the source candidates; callbacks and method overrides remain unverified.
    return { ...result, complete: false };
  }

  private isArraySource(
    expression: SyntaxNode | undefined,
    context: SyntaxNode,
    depth: number
  ): boolean {
    if (!expression || depth > MAX_PROJECTION_DEPTH) {
      return false;
    }

    if (expression.type === "ArrayExpression") {
      return true;
    }

    let value: SyntaxNode | undefined;

    if (TYPE_WRAPPERS.has(expression.type)) {
      value = expression.expression as SyntaxNode;
    } else if (expression.type === "Identifier") {
      const binding = this.evaluator.getBinding(String(expression.name), context);
      const declaration = binding && this.evaluator.parents.get(binding);

      if (
        declaration?.type !== "VariableDeclarator" ||
        this.evaluator.parents.get(declaration)?.kind !== "const"
      ) {
        return false;
      }

      value = declaration.init as SyntaxNode;
    } else if (expression.type === "CallExpression") {
      const callee = expression.callee as SyntaxNode;
      value = this.isReactiveCall(callee, context)
        ? (expression.arguments as SyntaxNode[])[0]
        : undefined;
      const selection = readArraySelection(expression);

      if (selection?.isArrayResult) {
        value = selection.receiver;
      }
    }

    return !!value && this.isArraySource(value, value, depth + 1);
  }

  private isReactiveCall(callee: SyntaxNode, context: SyntaxNode) {
    const name = String(callee.name);

    return (
      callee.type === "Identifier" &&
      ["$derived", "$state"].includes(name) &&
      !this.evaluator.getBinding(name, context)
    );
  }

  private projectIdentifier(
    expression: SyntaxNode,
    context: SyntaxNode,
    path: readonly string[],
    depth: number
  ): FiniteIconValues {
    const binding = this.evaluator.getBinding(String(expression.name), context);
    const declaration = binding && this.evaluator.parents.get(binding);

    if (!path.length && isSnippetOrFunction(binding, declaration)) {
      return { values: new Set(), complete: true };
    }

    const iteration = this.projectIteration(binding, declaration, path, depth);

    if (iteration) {
      return iteration;
    }

    const finiteValues = path.length ? undefined : this.evaluator.getValues(expression, context);

    if (finiteValues?.complete) {
      return finiteValues;
    }

    if (
      !binding ||
      declaration?.type !== "VariableDeclarator" ||
      this.evaluator.parents.get(declaration)?.kind !== "const"
    ) {
      return finiteValues ?? { values: new Set(), complete: false };
    }

    const value = declaration.init as SyntaxNode | undefined;
    const result = this.projectValues(value, value ?? context, path, depth + 1);
    const owner = this.evaluator.parents.get(declaration);
    const isExported =
      !!owner && this.evaluator.parents.get(owner)?.type === "ExportNamedDeclaration";

    return {
      values: new Set([...(finiteValues?.values ?? []), ...result.values]),
      complete: result.complete && !this.isBindingEscaped(binding) && !isExported,
    };
  }

  private projectIteration(
    binding: SyntaxNode | undefined,
    declaration: SyntaxNode | undefined,
    path: readonly string[],
    depth: number
  ): FiniteIconValues | undefined {
    if (declaration?.type === "EachBlock" && declaration.context === binding) {
      const expression = declaration.expression as SyntaxNode;

      return this.projectValues(expression, expression, ["*", ...path], depth + 1);
    }

    const pattern = declaration && this.evaluator.parents.get(declaration);
    const each = pattern && this.evaluator.parents.get(pattern);

    if (
      declaration?.type !== "Property" ||
      pattern?.type !== "ObjectPattern" ||
      each?.type !== "EachBlock"
    ) {
      return;
    }

    if (declaration.computed) {
      return { values: new Set(), complete: false };
    }

    const expression = each.expression as SyntaxNode;

    return this.projectValues(
      expression,
      expression,
      ["*", readPropertyName(declaration), ...path],
      depth + 1
    );
  }

  private projectMember(
    expression: SyntaxNode,
    context: SyntaxNode,
    path: readonly string[],
    depth: number
  ): FiniteIconValues {
    const property = expression.property as SyntaxNode;
    const isNumericIndex = property.type === "Literal" && typeof property.value === "number";
    let keys: FiniteIconValues;

    if (isNumericIndex) {
      keys = { values: new Set([String(property.value)]), complete: true };
    } else if (expression.computed) {
      keys = this.evaluator.getValues(property, context);
    } else {
      keys = { values: new Set([String(property.name)]), complete: true };
    }

    const object = expression.object as SyntaxNode;
    const read = (key: string) => this.projectValues(object, object, [key, ...path], depth + 1);

    if (!keys.complete || !keys.values.size) {
      return { ...read("*"), complete: false };
    }

    return mergeIconValues([...keys.values].map(read), !!keys.values.size);
  }

  private projectObject(
    expression: SyntaxNode,
    context: SyntaxNode,
    path: readonly string[],
    depth: number
  ): FiniteIconValues {
    const values: FiniteIconValues[] = [];
    let hasAccessor = false;

    for (const property of expression.properties as SyntaxNode[]) {
      hasAccessor ||= property.kind === "get" || property.kind === "set";

      if (
        property.type !== "SpreadElement" &&
        !property.computed &&
        path[0] !== "*" &&
        readPropertyName(property) !== path[0]
      ) {
        continue;
      }

      values.push(this.projectProperty(property, context, path, depth));
    }

    return mergeIconValues(values, !hasAccessor);
  }

  private projectProperty(
    property: SyntaxNode,
    context: SyntaxNode,
    path: readonly string[],
    depth: number
  ): FiniteIconValues {
    const [field, ...rest] = path;
    const isSpread = property.type === "SpreadElement";

    if (property.kind === "get") {
      return { values: new Set(), complete: false };
    }

    if (property.computed && field !== "*") {
      const keys = this.evaluator.getValues(property.key, context);

      if (!keys.complete) {
        return { values: new Set(), complete: false };
      }

      if (!keys.values.has(field)) {
        return { values: new Set(), complete: true };
      }
    }

    const value = (isSpread ? property.argument : property.value) as SyntaxNode;

    return this.projectValues(value, value ?? context, isSpread ? path : rest, depth + 1);
  }

  private isBindingEscaped(binding: SyntaxNode) {
    const cached = this.escapedBindings.get(binding);

    if (cached !== undefined) {
      return cached;
    }

    const isEscaped = this.escapingExpressions.some((expression) =>
      this.doesReferenceBinding(expression, binding)
    );
    this.escapedBindings.set(binding, isEscaped);

    return isEscaped;
  }

  private readNodeEscapes(node: SyntaxNode) {
    const isComponent = ["Component", "SvelteComponent", "SvelteSelf", "SvelteElement"].includes(
      node.type
    );
    const isCustomElement = node.type === "RegularElement" && String(node.name).includes("-");

    if (!isComponent && !isCustomElement) {
      return readEscapingExpressions(node);
    }

    const component =
      node.type === "Component" ? this.getTarget(String(node.name), node)?.component : undefined;
    const iconProps = component ? getIconProps(component).map((path) => path.split(".")[0]) : [];

    return ((node.attributes ?? []) as SyntaxNode[]).flatMap((attribute) => {
      // Registered icon props are handled by Quaff's known icon consumers.
      if (attribute.type === "Attribute" && iconProps.includes(String(attribute.name))) {
        return [];
      }

      return readSyntaxChildren(attribute);
    });
  }

  private doesReferenceBinding(
    expression: SyntaxNode | undefined,
    binding: SyntaxNode,
    depth = 0
  ): boolean {
    if (!expression || depth > MAX_PROJECTION_DEPTH) {
      return !!expression;
    }

    if (expression.type === "Identifier") {
      const reference = this.evaluator.getBinding(String(expression.name), expression);

      if (reference === binding) {
        return true;
      }

      const source = reference && this.templateSources.get(reference);

      return this.doesReferenceBinding(source, binding, depth + 1);
    }

    if (expression.type === "MemberExpression") {
      return this.doesReferenceBinding(expression.object as SyntaxNode, binding, depth + 1);
    }

    if (expression.type === "Property") {
      return this.doesReferenceBinding(expression.value as SyntaxNode, binding, depth + 1);
    }

    return readSyntaxChildren(expression).some((child) =>
      this.doesReferenceBinding(child, binding, depth + 1)
    );
  }

  private collectValues(
    expression: SyntaxNode,
    context: SyntaxNode,
    path: readonly string[] = [],
    prefix?: string
  ) {
    const result = this.projectValues(expression, context, path);

    for (const value of result.values) {
      this.addNames(value, context, prefix);
    }

    if (!result.complete) {
      this.report(
        context,
        "Safelist icons supplied by runtime, imported, or unsupported expressions."
      );
    }
  }

  private addNames(value: string, context: SyntaxNode, prefix?: string) {
    addSymbolNames(this.usage.names, value, prefix);

    if (PRIVATE_GLYPH_PATTERN.test(value)) {
      this.report(context, "Safelist the icon names corresponding to private Unicode glyphs.");
    }
  }

  private collectAttribute(attribute: SyntaxNode, path: readonly string[], component: string) {
    const prefix = isComponentName(component)
      ? COMPONENT_DEFINITIONS[component].iconPrefix
      : undefined;

    if (attribute.type === "SpreadAttribute") {
      this.collectValues(attribute.expression as SyntaxNode, attribute, path, prefix);

      return;
    }

    const values = readAttributeValues(attribute);

    if (values.length > 1 && values.some((value) => value.type === "ExpressionTag")) {
      this.report(
        attribute,
        "Use a finite template expression or safelist interpolated icon attributes."
      );

      return;
    }

    if (attribute.type === "BindDirective") {
      this.collectValues(attribute.expression as SyntaxNode, attribute, path.slice(1), prefix);

      return;
    }

    for (const value of values as SyntaxNode[]) {
      if (value.type === "Text") {
        this.addNames(String(value.data), attribute, prefix);
      } else if (value.type === "ExpressionTag") {
        this.collectValues(value.expression as SyntaxNode, attribute, path.slice(1), prefix);
      }
    }
  }

  private collectComponent(node: SyntaxNode, component: string) {
    if (isComponentName(component)) {
      this.usage.components.add(component);
    }

    const paths = getIconProps(component);
    const attributes = (node.attributes ?? []) as SyntaxNode[];

    for (const path of paths) {
      this.collectComponentProp(attributes, path.split("."), component);
    }

    const primaryProp = component === "QIcon" ? "name" : "icon";
    const hasLiteralIcon = attributes.some(
      (attribute) =>
        attribute.name === primaryProp &&
        readAttributeValues(attribute).some(
          (value) => value.type === "Text" && String(value.data).length > 0
        )
    );

    if (paths.includes("children") && !hasLiteralIcon) {
      this.collectIconChildren(node.fragment as SyntaxNode);
    }
  }

  private collectComponentProp(attributes: SyntaxNode[], path: string[], component: string) {
    const matching = attributes.filter(
      (attribute) => attribute.type === "SpreadAttribute" || attribute.name === path[0]
    );
    const lastExplicit = matching.findLastIndex(
      (attribute) => attribute.type !== "SpreadAttribute"
    );

    for (const attribute of matching.slice(Math.max(0, lastExplicit))) {
      this.collectAttribute(attribute, path, component);
    }
  }

  private collectIconChildren(fragment: SyntaxNode | undefined) {
    if (!fragment) {
      return;
    }

    for (const child of (fragment.nodes ?? []) as SyntaxNode[]) {
      this.collectIconChild(child);
    }
  }

  private collectIconChild(child: SyntaxNode) {
    if (child.type === "Text") {
      this.addNames(String(child.data), child);
    } else if (child.type === "ExpressionTag") {
      this.collectValues(child.expression as SyntaxNode, child);
    } else if (child.type === "RenderTag") {
      this.report(child, "Safelist icon text supplied by an opaque snippet.");
    } else if (child.type.endsWith("Block") || child.type === "Fragment") {
      const fragments = readSyntaxChildren(child).filter((branch) => branch.type === "Fragment");

      for (const fragment of fragments) {
        this.collectIconChildren(fragment);
      }
    } else if (child.type === "RegularElement" && !["svg", "img"].includes(String(child.name))) {
      this.collectIconChildren(child.fragment as SyntaxNode);
    }
  }

  private collectRawElement(node: SyntaxNode) {
    const { classes, hasIconFont } = this.readRawClasses((node.attributes ?? []) as SyntaxNode[]);

    for (const className of classes) {
      const baseClass = className.split(/--|__/, 1)[0];
      COMPONENTS_BY_CLASS.get(baseClass)?.forEach((component) =>
        this.usage.components.add(component)
      );
    }

    const hasIconClass = [...classes].some(
      (className) => ICON_CLASS_PATTERN.test(className) || this.iconClasses.has(className)
    );

    if (hasIconFont || hasIconClass) {
      this.collectIconChildren(node.fragment as SyntaxNode);
    }
  }

  private readRawClasses(attributes: SyntaxNode[]) {
    const classes = new Set<string>();
    let hasIconFont = false;

    for (const attribute of attributes) {
      if (attribute.type === "ClassDirective") {
        classes.add(String(attribute.name));
      }

      if (!["class", "style"].includes(String(attribute.name))) {
        continue;
      }

      const candidates = readAttributeValues(attribute).flatMap((value) => [
        ...this.readRawAttributeCandidates(value, attribute),
      ]);

      if (attribute.name === "class") {
        const names = candidates.flatMap((candidate) => candidate.split(/\s+/));
        names.forEach((name) => classes.add(name));
      } else {
        hasIconFont ||= candidates.some((candidate) => ICON_FONT_PATTERN.test(candidate));
      }
    }

    return { classes, hasIconFont };
  }

  private readRawAttributeCandidates(value: SyntaxNode, attribute: SyntaxNode): Iterable<string> {
    if (value.type === "Text") {
      return [String(value.data)];
    }

    const expression = value.expression as SyntaxNode | undefined;

    if (attribute.name !== "class") {
      return this.evaluator.getValues(expression, attribute).values;
    }

    const result = this.readClassValues(expression, attribute);
    const hasKnownIconFont = [...result.values]
      .flatMap((candidate) => candidate.split(/\s+/))
      .some((className) => ICON_CLASS_PATTERN.test(className) || this.iconClasses.has(className));

    if (!result.complete && !hasKnownIconFont) {
      this.report(attribute, "Safelist icon names when runtime classes select an icon font.");
    }

    return result.values;
  }

  private readClassValues(
    expression: SyntaxNode | undefined,
    context: SyntaxNode,
    depth = 0
  ): FiniteIconValues {
    if (!expression || depth > 12) {
      return { values: new Set(), complete: false };
    }

    const read = (child: SyntaxNode) => this.readClassValues(child, context, depth + 1);

    if (expression.type === "ArrayExpression") {
      const elements = (expression.elements as (SyntaxNode | null)[]).filter(
        (element): element is SyntaxNode => !!element
      );

      return mergeIconValues(elements.map(read));
    }

    if (expression.type !== "ObjectExpression") {
      return this.evaluator.getValues(expression, context);
    }

    const results = (expression.properties as SyntaxNode[]).flatMap((property) =>
      this.readClassProperty(property, context, depth)
    );

    return mergeIconValues(results);
  }

  private readClassProperty(
    property: SyntaxNode,
    context: SyntaxNode,
    depth: number
  ): FiniteIconValues[] {
    const value = property.value as SyntaxNode | undefined;

    if (value?.type === "Literal" && !value.value) {
      return [];
    }

    if (property.type === "SpreadElement") {
      return [this.readClassValues(property.argument as SyntaxNode, context, depth + 1)];
    }

    if (property.computed) {
      return [this.evaluator.getValues(property.key, context)];
    }

    return [{ values: new Set([readPropertyName(property)]), complete: true }];
  }

  private collectCall(node: SyntaxNode) {
    const reference = readReference(node.callee as SyntaxNode);

    if (!reference) {
      return;
    }

    const target = this.getTarget(reference, node);

    if (target?.isRenderer) {
      this.collectRenderedComponent(node);

      return;
    }

    const owner = reference.split(".").slice(0, -1).join(".");

    if (this.getTarget(owner, node)?.utility === "Notify") {
      UTILITY_COMPONENT_DEPENDENCIES.Notify.forEach((name) => this.usage.components.add(name));
    }
  }

  private collectRenderedComponent(node: SyntaxNode) {
    const [componentExpression, options] = node.arguments as SyntaxNode[];
    const componentReference = readReference(componentExpression);
    const component = componentReference && this.getTarget(componentReference, node)?.component;

    if (
      !component &&
      componentReference &&
      this.isKnownNonQuaffComponent(componentReference, node)
    ) {
      return;
    }

    if (!component) {
      this.report(node, "Include dynamically rendered components and safelist their icon props.");

      return;
    }

    if (isComponentName(component)) {
      this.usage.components.add(component);
    }

    if (!options) {
      return;
    }

    for (const path of getIconProps(component)) {
      const prefix = isComponentName(component)
        ? COMPONENT_DEFINITIONS[component].iconPrefix
        : undefined;
      this.collectValues(options, node, ["props", ...path.split(".")], prefix);
    }
  }

  private isKnownNonQuaffComponent(reference: string, context: SyntaxNode) {
    const binding = this.evaluator.getBinding(reference.split(".")[0], context) as
      SyntaxNode | undefined;
    const declaration = binding && this.evaluator.parents.get(binding);
    const imported = declaration && this.evaluator.parents.get(declaration);

    if (!declaration?.type.startsWith("Import") || imported?.type !== "ImportDeclaration") {
      return false;
    }

    const source = String((imported.source as SyntaxNode).value);

    return !source.startsWith("@quaffui/quaff") && !source.startsWith("#components/");
  }
}

function collectTemplateSources(nodes: SyntaxNode[]) {
  const sources = new WeakMap<SyntaxNode, SyntaxNode>();

  for (const node of nodes) {
    if (!["EachBlock", "AwaitBlock"].includes(node.type)) {
      continue;
    }

    const patterns = node.type === "EachBlock" ? [node.context] : [node.value, node.error];
    const bindings = patterns.flatMap((pattern) =>
      readPatternBindings(pattern as SyntaxNode | undefined)
    );

    for (const binding of bindings) {
      sources.set(binding, node.expression as SyntaxNode);
    }
  }

  return sources;
}

function readPatternBindings(pattern: SyntaxNode | undefined): SyntaxNode[] {
  switch (pattern?.type) {
    case "Identifier":
      return [pattern];
    case "Property":
      return readPatternBindings(pattern.value as SyntaxNode);
    case "AssignmentPattern":
      return readPatternBindings(pattern.left as SyntaxNode);
    case "RestElement":
      return readPatternBindings(pattern.argument as SyntaxNode);
    case "ObjectPattern":
    case "ArrayPattern":
      return readSyntaxChildren(pattern).flatMap(readPatternBindings);
    default:
      return [];
  }
}

function readEscapingExpressions(node: SyntaxNode): (SyntaxNode | undefined)[] {
  switch (node.type) {
    case "ExportNamedDeclaration":
      return readLocalExports(node);
    case "ExportDefaultDeclaration":
      return [node.declaration as SyntaxNode];
    case "VariableDeclarator":
      return [node.init as SyntaxNode | undefined];
    case "AssignmentExpression":
      return [node.left, node.right] as SyntaxNode[];
    case "AssignmentPattern":
    case "ForOfStatement":
      return [node.right as SyntaxNode];
    case "BindDirective":
    case "UseDirective":
    case "TransitionDirective":
    case "AnimateDirective":
      return [node.expression as SyntaxNode];
    case "UpdateExpression":
    case "ReturnStatement":
    case "YieldExpression":
    case "ThrowStatement":
      return [node.argument as SyntaxNode | undefined];
    case "CallExpression":
    case "NewExpression":
      return [node.callee as SyntaxNode, ...(node.arguments as SyntaxNode[])];
    case "ArrowFunctionExpression": {
      const body = node.body as SyntaxNode;

      return body.type === "BlockStatement" ? [] : [body];
    }
    case "PropertyDefinition":
      return [node.value as SyntaxNode | undefined];
    case "TaggedTemplateExpression":
      return [node.tag, node.quasi] as SyntaxNode[];
    default:
      return [];
  }
}

function readLocalExports(node: SyntaxNode): SyntaxNode[] {
  if (node.source || node.exportKind === "type") {
    return [];
  }

  return (node.specifiers as SyntaxNode[]).flatMap((specifier) =>
    specifier.exportKind === "type" ? [] : [specifier.local as SyntaxNode]
  );
}

function readArraySelection(expression: SyntaxNode) {
  const callee = expression.callee as SyntaxNode;

  if (callee.type !== "MemberExpression" || callee.computed) {
    return;
  }

  const method = String((callee.property as SyntaxNode).name);
  const resultKind = ARRAY_SELECTION_RESULTS.get(method);

  if (!resultKind) {
    return;
  }

  return { isArrayResult: resultKind === "array", receiver: callee.object as SyntaxNode };
}

function isNonFontExpression(expression: SyntaxNode) {
  if (["ArrowFunctionExpression", "FunctionExpression"].includes(expression.type)) {
    return true;
  }

  if (expression.type !== "TemplateLiteral") {
    return false;
  }

  const first = (expression.quasis as SyntaxNode[])[0];

  return String((first.value as { raw: string }).raw).startsWith("img:");
}

function isSnippetOrFunction(binding: SyntaxNode | undefined, declaration: SyntaxNode | undefined) {
  const value =
    declaration?.type === "VariableDeclarator"
      ? (declaration.init as SyntaxNode | undefined)
      : declaration;

  return (
    (declaration?.type === "SnippetBlock" && declaration.expression === binding) ||
    (!!value && FUNCTION_TYPES.has(value.type))
  );
}

function readNamespaceTarget(imported: ImportTarget, member?: string): ImportTarget | undefined {
  if (imported.namespace === "quaff" && member) {
    if (member === "Notify") {
      return { utility: "Notify" };
    }

    return isComponentName(member) ? { component: member } : undefined;
  }

  if (imported.namespace === "svelte" && member && ["mount", "render"].includes(member)) {
    return { isRenderer: true };
  }

  return member ? undefined : imported;
}

function readImportTarget(
  source: string,
  specifier: SyntaxNode,
  isLibrary: boolean
): ImportTarget | undefined {
  const namespace = Object.hasOwn(IMPORT_NAMESPACES, source)
    ? IMPORT_NAMESPACES[source]
    : undefined;

  if (specifier.type === "ImportNamespaceSpecifier") {
    return namespace ? { namespace } : undefined;
  }

  const imported = specifier.imported as SyntaxNode | undefined;
  const name = String(imported?.name ?? imported?.value ?? "");

  if (namespace && name) {
    const target = readNamespaceTarget({ namespace }, name);

    if (target) {
      return target;
    }
  }

  if (specifier.type !== "ImportDefaultSpecifier") {
    return;
  }

  const direct =
    source
      .split("/")
      .at(-1)
      ?.replace(/\.svelte$/, "") ?? "";
  const isComponentSource =
    source.startsWith("@quaffui/quaff/components/") ||
    source.startsWith("#components/") ||
    isLibrary;

  if (isComponentSource && (isComponentName(direct) || Object.hasOwn(PRIVATE_ICON_PROPS, direct))) {
    return { component: direct };
  }
}

function getIconProps(component: string): readonly string[] {
  if (isComponentName(component)) {
    return COMPONENT_DEFINITIONS[component].iconProps ?? [];
  }

  return PRIVATE_ICON_PROPS[component] ?? [];
}

function isComponentName(value: string): value is ComponentName {
  return Object.hasOwn(COMPONENT_DEFINITIONS, value);
}

function readReference(node: SyntaxNode | undefined): string | undefined {
  if (!node) {
    return;
  }

  if (TYPE_WRAPPERS.has(node.type)) {
    return readReference(node.expression as SyntaxNode);
  }

  if (node.type === "Identifier") {
    return String(node.name);
  }

  if (node.type === "MemberExpression" && !node.computed) {
    const owner = readReference(node.object as SyntaxNode);

    return owner && `${owner}.${String((node.property as SyntaxNode).name)}`;
  }
}

function readAttributeValues(attribute: SyntaxNode): SyntaxNode[] {
  if (Array.isArray(attribute.value)) {
    return attribute.value;
  }

  const value = attribute.value as SyntaxNode | undefined;

  return value?.type ? [value] : [];
}

function readPropertyName(property: SyntaxNode) {
  const key = property.key as SyntaxNode | undefined;

  return String(key?.name ?? key?.value ?? "");
}

function mergeIconValues(results: FiniteIconValues[], isComplete = true): FiniteIconValues {
  const values = new Set(results.flatMap((result) => [...result.values]));

  return { values, complete: isComplete && results.every((result) => result.complete) };
}

function createComponentClassIndex() {
  const components = new Map<string, ComponentName[]>();

  for (const [name, definition] of Object.entries(COMPONENT_DEFINITIONS)) {
    for (const className of definition.classes) {
      const owners = components.get(className) ?? [];
      owners.push(name as ComponentName);
      components.set(className, owners);
    }
  }

  return components;
}
