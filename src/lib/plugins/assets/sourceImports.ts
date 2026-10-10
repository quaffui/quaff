import { parseSourceSyntax } from "./sourceSyntax.js";

interface SourceNode {
  type: string;
  [key: string]: unknown;
}

const IMPORT_DECLARATIONS = new Set([
  "ImportDeclaration",
  "ExportNamedDeclaration",
  "ExportAllDeclaration",
]);
const GLOB_METHODS = new Set(["glob", "globEager"]);

/** Undefined means runtime dependencies cannot be resolved conservatively. */
export async function collectSourceImports(code: string): Promise<Set<string> | undefined> {
  const syntax = await parseSourceSyntax(code);

  if (!syntax) {
    return;
  }

  const imports = new Set<string>();
  const pending: unknown[] = [syntax.instance?.content, syntax.module?.content, syntax.fragment];

  while (pending.length) {
    const value = pending.pop();

    if (Array.isArray(value)) {
      pending.push(...value);

      continue;
    }

    if (!value || typeof value !== "object" || !("type" in value)) {
      continue;
    }

    const node = value as SourceNode;

    if (isTypeOnlyNode(node)) {
      continue;
    }

    if (!collectNodeImport(node, imports)) {
      return;
    }

    pending.push(...Object.values(node));
  }

  return imports;
}

function isTypeOnlyNode(node: SourceNode) {
  if (!IMPORT_DECLARATIONS.has(node.type)) {
    return false;
  }

  if (node.importKind === "type" || node.exportKind === "type") {
    return true;
  }

  const specifiers = node.specifiers as SourceNode[] | undefined;

  return (
    !!specifiers?.length &&
    specifiers.every(
      (specifier) => specifier.importKind === "type" || specifier.exportKind === "type"
    )
  );
}

function collectNodeImport(node: SourceNode, imports: Set<string>) {
  if (isImportMetaGlob(node)) {
    return false;
  }

  if (!IMPORT_DECLARATIONS.has(node.type) && node.type !== "ImportExpression") {
    return true;
  }

  if (!node.source) {
    return true;
  }

  const source = readStaticString(node.source as SourceNode);

  if (source === undefined) {
    return false;
  }

  imports.add(source);

  return true;
}

function isImportMetaGlob(node: SourceNode) {
  if (node.type !== "MemberExpression") {
    return false;
  }

  const receiver = node.object as SourceNode;
  const property = node.property as SourceNode;
  const meta = receiver.meta as SourceNode | undefined;
  const metaProperty = receiver.property as SourceNode | undefined;
  const name = node.computed ? readStaticString(property) : property.name;

  return (
    receiver.type === "MetaProperty" &&
    meta?.name === "import" &&
    metaProperty?.name === "meta" &&
    typeof name === "string" &&
    GLOB_METHODS.has(name)
  );
}

function readStaticString(node: SourceNode): string | undefined {
  if (node.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }

  if (node.type !== "TemplateLiteral" || (node.expressions as unknown[]).length) {
    return;
  }

  const [quasi] = node.quasis as SourceNode[];
  const value = quasi.value as { cooked: string | null };

  return value.cooked ?? undefined;
}
