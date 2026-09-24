import { describe, expect, it } from "vitest";
import ts from "typescript";
import renderDocs from "./renderDocs.js";
import { validateDocgenResponse } from "./rustClient.js";
import type { DocgenInterface } from "./types.js";
import type { QComponentDocs } from "../../src/docs/types.js";

function evaluate(source: string) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports: Record<string, unknown> = {};
  new Function("exports", outputText)(exports);
  return exports;
}

const EXAMPLE: DocgenInterface = {
  name: "QExampleProps",
  componentName: "QExample",
  description:
    'An example with `code`, "quotes" and ${interpolation}.\n\n```svelte\n<QExample />\n```',
  generics: [{ name: "T", constraint: "<span>string</span>" }],
  domAttributesConstraint: "<a>HTMLAttributes</a>",
  props: [{ name: "value", header: "<div>value: T</div>", description: "Value" }],
  snippets: [{ name: "children", header: "children()", description: "Content" }],
  methods: [{ name: "focus", header: "focus()", description: "Focuses." }],
  typeDependencies: { ExampleType: "type ExampleType = string;" },
};

describe("generated component docs", () => {
  it("assembles descriptions and all generated API sections without legacy events", async () => {
    const source = await renderDocs([EXAMPLE], "fixture-hash");
    const parsed = ts.createSourceFile("docs.ts", source, ts.ScriptTarget.Latest);
    const imports = parsed.statements.filter(ts.isImportDeclaration);
    expect(imports).toHaveLength(1);
    expect(imports[0].importClause?.isTypeOnly).toBe(true);
    expect(imports[0].moduleSpecifier.getText(parsed)).toBe('"$docs"');
    const output = evaluate(source);
    const docs = output.QExampleDocs as QComponentDocs;

    expect(docs.name).toBe("QExample");
    expect(docs.componentName).toBeUndefined();
    expect(docs.description).toBe(EXAMPLE.description);
    expect(docs.docs).toEqual({
      generics: EXAMPLE.generics,
      domAttributesConstraint: EXAMPLE.domAttributesConstraint,
      props: EXAMPLE.props,
      snippets: EXAMPLE.snippets,
      methods: EXAMPLE.methods,
      typeDependencies: EXAMPLE.typeDependencies,
    });
  });

  it("keeps interface exports distinct when one component has several props interfaces", async () => {
    const interfaces = ["Vertical", "Horizontal"].map((variant) => ({
      ...EXAMPLE,
      name: `QSeparator${variant}Props`,
      componentName: "QSeparator",
    }));
    const output = evaluate(await renderDocs(interfaces));

    expect(Object.keys(output)).toEqual(["QSeparatorHorizontalDocs", "QSeparatorVerticalDocs"]);
    expect(output.QSeparatorVerticalDocs).toMatchObject({
      name: "QSeparatorVertical",
      componentName: "QSeparator",
    });
  });

  it("allows missing component comments and rejects invalid response descriptions", async () => {
    const noDescription = { ...EXAMPLE, description: undefined, componentName: undefined };
    const output = evaluate(await renderDocs([noDescription]));
    expect(output.QExampleDocs).toMatchObject({ name: "QExample", description: "" });

    for (const field of ["description", "componentName"]) {
      expect(() =>
        validateDocgenResponse({
          version: 1,
          components: [
            { propsFile: "/example/props.ts", interfaces: [{ ...EXAMPLE, [field]: 42 }] },
          ],
        })
      ).toThrow("invalid data for QExampleProps");
    }

    await expect(renderDocs([{ ...EXAMPLE, name: "QExample;throw Error()Props" }])).rejects.toThrow(
      "Cannot render invalid props interface name"
    );
  });
});
