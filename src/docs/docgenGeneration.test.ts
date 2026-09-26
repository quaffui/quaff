import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import ts from "typescript";
import runDocgen from "../../docgen/run.js";
import type { QComponentDocs } from "./types";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

async function generateFixture(props: string, component: string) {
  const root = await mkdtemp(path.join(tmpdir(), "quaff-docgen-generation-"));
  directories.push(root);
  const directory = path.join(root, "src/lib/components/example");
  await mkdir(directory, { recursive: true });
  await Promise.all([
    writeFile(path.join(root, ".prettierrc"), "{}"),
    writeFile(path.join(root, "package.json"), "{}"),
    writeFile(path.join(root, "bun.lock"), "{}"),
    writeFile(path.join(directory, "props.ts"), props),
    writeFile(path.join(directory, "QExample.svelte"), component),
  ]);
  await runDocgen({ projectRoot: root });
  const source = await readFile(path.join(directory, "docs.ts"), "utf8");
  const { outputText, diagnostics } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  expect(diagnostics).toEqual([]);
  const exports: Record<string, QComponentDocs> = {};
  new Function("exports", outputText)(exports);
  return { source, exports };
}

describe("generated TypeScript documentation", () => {
  it("preserves component metadata and every API section in executable TypeScript", async () => {
    const description =
      'An example with `code`, "quotes" and ${interpolation}.\n\n```svelte\n<QExample />\n```';
    const { source, exports } = await generateFixture(
      `
      import type { Snippet } from "svelte";
      import type { HTMLAttributes } from "svelte/elements";
      export type ExampleType = "alpha" | "bravo" | "charlie" | "delta" | "echo" | "foxtrot" | "golf" | "hotel" | "india" | "juliet";
      export interface QExampleProps<T extends string = "ready"> extends HTMLAttributes<HTMLDivElement> {
        /** The selected value. */
        value?: T;
        /** Rendered content. */
        children?: Snippet<[{ value: T }]>;
        kind?: ExampleType;
      }
    `,
      `<!-- @component\n${description}\n-->
      <script lang="ts" generics="T extends string">
        let { value = "ready" } = $props();
        /** Focuses the element. */
        export function focus(): void {}
      </script>`
    );
    const docs = exports.QExampleDocs;
    const parsed = ts.createSourceFile("docs.ts", source, ts.ScriptTarget.Latest);
    const imports = parsed.statements.filter(ts.isImportDeclaration);
    expect(imports).toHaveLength(1);
    expect(imports[0].importClause?.isTypeOnly).toBe(true);
    expect(imports[0].moduleSpecifier.getText(parsed)).toBe('"$docs"');
    expect(docs.name).toBe("QExample");
    expect(docs.componentName).toBeUndefined();
    expect(docs.description).toBe(description);
    expect(docs.docs.generics).toEqual([
      {
        name: "T",
        constraint: expect.stringContaining("string"),
        default: expect.stringContaining("ready"),
      },
    ]);
    expect(docs.docs.domAttributesConstraint).toContain("HTMLAttributes");
    expect(docs.docs.props).toEqual(
      expect.arrayContaining([
        {
          name: "value",
          header: expect.stringContaining("ready"),
          description: "The selected value.",
        },
      ])
    );
    expect(docs.docs.snippets).toEqual([
      {
        name: "children",
        header: expect.stringContaining("value"),
        description: "Rendered content.",
      },
    ]);
    expect(docs.docs.methods).toEqual([
      {
        name: "focus",
        header: expect.stringContaining("focus"),
        description: "Focuses the element.",
      },
    ]);
    expect(docs.docs.typeDependencies.ExampleType).toContain('| "alpha"');
    expect(docs.docs).not.toHaveProperty("events");
    expect(source).not.toContain("./docs.props");
  }, 60_000);

  it("preserves prototype-named definitions as own properties", async () => {
    const { exports } = await generateFixture(
      `
      export type __proto__ = string;
      export type constructor = number;
      export interface QExampleProps { prototype?: __proto__; construct?: constructor; }
    `,
      "<p>Example</p>"
    );
    const definitions = exports.QExampleDocs.docs.typeDependencies;
    expect(Object.hasOwn(definitions, "__proto__")).toBe(true);
    expect(definitions.__proto__).toBe("type __proto__ = string;");
    expect(Object.hasOwn(definitions, "constructor")).toBe(true);
    expect(definitions.constructor).toBe("type constructor = number;");
    expect(exports.QExampleDocs.description).toBe("");
  }, 60_000);

  it("keeps variant exports distinct while sharing the component and its defaults", async () => {
    const { exports } = await generateFixture(
      `
      export interface QExampleVerticalProps { vertical?: boolean; }
      export interface QExampleHorizontalProps { vertical?: boolean; }
    `,
      '<script lang="ts">let { vertical = false } = $props();</script>'
    );
    expect(Object.keys(exports)).toEqual(["QExampleHorizontalDocs", "QExampleVerticalDocs"]);

    for (const [name, docs] of Object.entries(exports)) {
      expect(docs.name).toBe(name.replace(/Docs$/, ""));
      expect(docs.componentName).toBe("QExample");
      expect(docs.docs.props[0].header).toContain("false");
    }
  }, 60_000);
});
