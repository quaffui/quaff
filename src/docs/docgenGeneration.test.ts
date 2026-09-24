import { describe, expect, it } from "vitest";
import ts from "typescript";
import renderDocs from "../../docgen/props/renderDocs";
import { validateDocgenResponse } from "../../docgen/props/rustClient";
import type { QComponentDocs } from "./types";

describe("Rust docgen integration", () => {
  it("renders the stable generated export names", async () => {
    const output = await renderDocs([
      {
        name: "QExampleProps",
        generics: [{ name: "T", constraint: "<span>string</span>" }],
        domAttributesConstraint: "<a>HTMLAttributes</a>",
        props: [{ name: "value", header: "<div>value: T</div>", description: "Value" }],
        snippets: [],
        methods: [{ name: "focus", header: "<div>focus()</div>", description: "Focuses." }],
        typeDependencies: {
          ExampleType: "type ExampleType = string;",
          LongUnion:
            'type LongUnion = "alpha" | "bravo" | "charlie" | "delta" | "echo" | "foxtrot" | "golf" | "hotel" | "india" | "juliet";',
        },
      },
    ]);

    expect(output).toContain("export const QExampleDocs: QComponentDocs");
    expect(output).not.toContain("./docs.props");
    expect(output).toContain('header: "<div>value: T</div>"');
    expect(output).toContain('header: "<div>focus()</div>"');
    expect(output).toContain('| "alpha"');
  });

  it("preserves prototype-named type definitions in the generated exports", async () => {
    const typeDependencies = Object.fromEntries([
      ["__proto__", "type __proto__ = string;"],
      ["constructor", "type constructor = number;"],
    ]);
    const output = await renderDocs([
      {
        name: "QExampleProps",
        generics: [],
        props: [],
        snippets: [],
        methods: [],
        typeDependencies,
      },
    ]);
    const { outputText } = ts.transpileModule(output, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    });
    const generatedExports: Record<string, unknown> = {};
    new Function("exports", outputText)(generatedExports);
    const definitions = (generatedExports.QExampleDocs as QComponentDocs).docs.typeDependencies;

    expect(Object.hasOwn(definitions, "__proto__")).toBe(true);
    expect(definitions.__proto__).toBe(typeDependencies.__proto__);
    expect(Object.hasOwn(definitions, "constructor")).toBe(true);
    expect(definitions.constructor).toBe(typeDependencies.constructor);
  });

  it("rejects malformed Rust response data", () => {
    expect(() =>
      validateDocgenResponse({
        version: 1,
        components: [
          {
            propsFile: "/component/props.ts",
            interfaces: [
              {
                name: "QExampleProps",
                generics: [],
                props: [{ name: "value", header: 42, description: "Value" }],
                snippets: [],
                methods: [],
                typeDependencies: {},
              },
            ],
          },
        ],
      })
    ).toThrow("invalid data for QExampleProps");
  });

  it("rejects interface names that cannot become generated identifiers", async () => {
    const invalidInterface = {
      name: "QExample;alert(1)Props",
      generics: [],
      props: [],
      snippets: [],
      methods: [],
      typeDependencies: {},
    };

    expect(() =>
      validateDocgenResponse({
        version: 1,
        components: [{ propsFile: "/component/props.ts", interfaces: [invalidInterface] }],
      })
    ).toThrow("invalid interface record");
    await expect(renderDocs([invalidInterface])).rejects.toThrow(
      "Cannot render invalid props interface name"
    );
  });
});
