import { describe, expect, it } from "vitest";
import renderDocsProps from "../../docgen/props/renderDocsProps";
import { validateDocgenResponse } from "../../docgen/props/rustClient";

describe("Rust docgen integration", () => {
  it("renders the stable generated export names", async () => {
    const output = await renderDocsProps([
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

    expect(output).toContain("export const QExampleDocsProps: QApiEntry[]");
    expect(output).toContain("export const QExampleDocsGenerics: QApiGeneric[]");
    expect(output).toContain("export const QExampleDocsMethods: QApiEntry[]");
    expect(output).toContain("export const QExampleDocsTypeDependencies: Record<string, string>");
    expect(output).toContain('header: "<div>value: T</div>"');
    expect(output).toContain('header: "<div>focus()</div>"');
    expect(output).toContain('| "alpha"');
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
    await expect(renderDocsProps([invalidInterface])).rejects.toThrow(
      "Cannot render invalid props interface name"
    );
  });
});
