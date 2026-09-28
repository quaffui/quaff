import { parse, preprocess, type AST } from "svelte/compiler";
import { COMPONENT_DEFINITIONS } from "../internal/componentRegistry.js";
import { tryCollectNamespaceComponents } from "./namespaceUsage.js";

export interface SourceUsage {
  candidates: Set<string>;
  componentPaths: Set<string>;
  hasFullCssImport: boolean;
  instanceScriptContentStart?: number;
  hasVirtualCssImport: boolean;
}

const CANDIDATE_PATTERN = /[A-Za-z0-9_-]+/g;
const DIRECT_COMPONENT_PATTERN = /@quaffui\/quaff\/components\/([^"'`\s?#]+)/g;
const TOKEN_GAP_PATTERN = String.raw`(?:\s|/\*[\s\S]*?\*/|//[^\r\n]*)*`;
// Only parse namespaces that could import Quaff; escaped sources need the parser to decode them.
const NAMESPACE_IMPORT_PATTERN = new RegExp(
  String.raw`\*${TOKEN_GAP_PATTERN}as${TOKEN_GAP_PATTERN}[^\s/"';*]+${TOKEN_GAP_PATTERN}` +
    String.raw`from${TOKEN_GAP_PATTERN}(?:["']@quaffui/quaff["']|["'][^"'\\\r\n]*\\)`
);

const DYNAMIC_IMPORT_PATTERN = new RegExp(
  String.raw`\bimport${TOKEN_GAP_PATTERN}\(${TOKEN_GAP_PATTERN}` + "[\"'`]@quaffui/quaff[\"'`]"
);
const WILDCARD_EXPORT_PATTERN = new RegExp(
  String.raw`\bexport${TOKEN_GAP_PATTERN}\*(?:${TOKEN_GAP_PATTERN}as${TOKEN_GAP_PATTERN}[\w$]+)?` +
    String.raw`${TOKEN_GAP_PATTERN}from${TOKEN_GAP_PATTERN}["']@quaffui/quaff["']`
);

export async function analyzeSource(code: string, isRootLayout = false): Promise<SourceUsage> {
  const candidates = new Set(code.match(CANDIDATE_PATTERN) ?? []);
  const componentPaths = new Set<string>();

  for (const match of code.matchAll(DIRECT_COMPONENT_PATTERN)) {
    componentPaths.add(match[1]);
  }

  const layout = isRootLayout ? await parseLayout(code) : undefined;

  if (
    NAMESPACE_IMPORT_PATTERN.test(code) &&
    !(await tryCollectNamespaceComponents(code, candidates, layout))
  ) {
    addAllComponents(candidates);
  }

  // Whole-package imports and re-exports can hide the selected components from this scan.
  if (DYNAMIC_IMPORT_PATTERN.test(code) || WILDCARD_EXPORT_PATTERN.test(code)) {
    addAllComponents(candidates);
  }

  const instanceScript = layout?.instance?.content as
    (AST.Script["content"] & { start: number }) | undefined;
  const imports = new Set(
    [layout?.instance, layout?.module].flatMap((script) =>
      (script?.content.body ?? []).flatMap((node) =>
        node.type === "ImportDeclaration" && !("importKind" in node && node.importKind === "type")
          ? [node.source.value]
          : []
      )
    )
  );

  return {
    candidates,
    componentPaths,
    hasFullCssImport: imports.has("@quaffui/quaff/css/index.css"),
    hasVirtualCssImport: imports.has("virtual:quaff.css") || imports.has("virtual:quaff/css"),
    instanceScriptContentStart: instanceScript?.start,
  };
}

async function parseLayout(code: string) {
  // Leave styles to the application's preprocessors while preserving script offsets.
  const layout = await preprocess(code, {
    style: ({ content }) => ({ code: content.replace(/[^\r\n]/g, " ") }),
  });

  return parse(layout.code, { modern: true });
}

function addAllComponents(candidates: Set<string>) {
  for (const name of Object.keys(COMPONENT_DEFINITIONS)) {
    candidates.add(name);
  }
}
