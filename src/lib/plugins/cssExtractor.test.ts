import { describe, expect, it, vi } from "vitest";
import { COMPONENT_DEFINITIONS } from "../internal/componentRegistry.js";
import { analyzeSource } from "./cssExtractor.js";
import * as namespaceUsage from "./namespaceUsage.js";

const COMPONENT_NAMES = Object.keys(COMPONENT_DEFINITIONS);
const NAMESPACE_IMPORT = 'import * as Quaff from "@quaffui/quaff";';
const FORMATS = [
  { name: "TypeScript", wrap: (source: string) => source },
  {
    name: "Svelte instance script",
    wrap: (source: string) => `<script lang="ts">${source}</script>`,
  },
  {
    name: "Svelte module script",
    wrap: (source: string) => `<script module lang="ts">${source}</script>`,
  },
];

function selectedComponents(candidates: Set<string>) {
  return COMPONENT_NAMES.filter((name) => candidates.has(name));
}

for (const { name, wrap } of FORMATS) {
  describe(`namespace analysis filter in ${name}`, () => {
    it.each([
      'import * as Icons from "other-library"; const icon = Icons[name];',
      'import {QBtn} from "@quaffui/quaff"; import * as Icons from "other-library";',
      'import * as Icons from "other-library"\nimport {QBtn} from "@quaffui/quaff";',
      'import * as Icons from "other-library"; const path = "escaped\\ntext";',
      'import * as Icons from "@quaffui/quaff-extra";',
    ])("skips namespace parsing for %s", async (source) => {
      const collect = vi.spyOn(namespaceUsage, "tryCollectNamespaceComponents");

      try {
        const usage = await analyzeSource(wrap(source));
        expect(collect).not.toHaveBeenCalled();
        expect(selectedComponents(usage.candidates)).toEqual(
          source.includes("QBtn") ? ["QBtn"] : []
        );
      } finally {
        collect.mockRestore();
      }
    });

    it.each([
      NAMESPACE_IMPORT,
      'import Default, * as Quaff from "@quaffui/quaff";',
      'import/* namespace */*/* binding */as/* name */Quaff/* source */from/* module */"@quaffui/quaff";',
      'import * as Quaff from\n// source\n"@quaffui/quaff";',
      String.raw`import * as Quaff from "@quaffui/\u0071uaff";`,
      String.raw`import * as Quaff from '\x40quaffui/quaff';`,
      'import * as Quaff from "@quaffui/\\\nquaff";',
    ])("retains CSS for a potentially escaped Quaff namespace: %s", async (source) => {
      const usage = await analyzeSource(wrap(`${source}\nconst Component = Quaff[name];`));
      expect(selectedComponents(usage.candidates)).toEqual(COMPONENT_NAMES);
    });
  });

  describe(`namespace CSS detection in ${name}`, () => {
    it.each([
      ["computed access", "const Component = Quaff[name];"],
      ["optional computed access", "const Component = Quaff?.[name];"],
      ["immutable alias", "const registry = Quaff; const Component = registry[name];"],
      [
        "asserted dynamic alias",
        "const registry = Quaff as typeof Quaff; const Component = registry[name];",
      ],
      [
        "chained alias",
        "const registry = Quaff; const controls = registry; const Component = controls[name];",
      ],
      ["computed destructuring", "const {[name]: Component} = Quaff;"],
      ["Reflect.get", "const Component = Reflect.get(Quaff, name);"],
      ["function argument", "registerComponents(Quaff);"],
      ["object spread", "const registry = {...Quaff};"],
      ["rest destructuring", "const {...registry} = Quaff;"],
      ["exported namespace", "export { Quaff };"],
      ["exported alias declaration", "export const registry = Quaff;"],
      ["exported asserted alias", "export const registry = Quaff as typeof Quaff;"],
      ["destructuring default", "const {control = consume(Quaff)} = data;"],
      ["computed binding key", "const {[consume(Quaff)]: control} = data;"],
      ["parameter default", "function render(control = consume(Quaff)) {}"],
      [
        "class static block var isolation",
        "class Other { static { var Quaff = {}; } } const Component = Quaff[name];",
      ],
      [
        "switch discriminant outside case bindings",
        "switch (consume(Quaff)) { case 1: const Quaff = {}; }",
      ],
      [
        "TypeScript namespace isolation",
        "namespace Other { export const Quaff = {}; } const Component = Quaff[name];",
      ],
      [
        "parameter default before body shadow",
        "function render(control = consume(Quaff)) { var Quaff = {}; }",
      ],
      [
        "locally shadowed Reflect",
        'const Reflect = { get(library, key) { return library[name]; } }; const Component = Reflect.get(Quaff, "QBtn");',
      ],
      [
        "nested real namespace escape",
        "function make() { const registry = Quaff; return registry[name]; }",
      ],
      ["exported alias", "const registry = Quaff; export { registry };"],
      ["mutable alias", "let registry = Quaff; const Component = registry[name];"],
    ])("keeps component CSS for %s", async (_, source) => {
      const usage = await analyzeSource(wrap(`${NAMESPACE_IMPORT}\n${source}`));
      expect(selectedComponents(usage.candidates)).toEqual(COMPONENT_NAMES);
    });

    it.each([
      ["dot access", "const Button = Quaff.QBtn;"],
      ["optional dot access", "const Button = Quaff?.QBtn;"],
      ["literal property", 'const Button = Quaff["QBtn"];'],
      ["template property", "const Button = Quaff[`QBtn`];"],
      ["immutable static alias", "const registry = Quaff; const Button = registry.QBtn;"],
      [
        "asserted static alias",
        "const registry = Quaff as typeof Quaff; const Button = registry.QBtn;",
      ],
      [
        "satisfies static alias",
        "const registry = Quaff satisfies typeof Quaff; const Button = registry.QBtn;",
      ],
      ["non-null static alias", "const registry = Quaff!; const Button = registry.QBtn;"],
      [
        "chained static alias",
        "const registry = Quaff; const controls = registry; const Button = controls.QBtn;",
      ],
      ["static destructuring", "const {QBtn: Button} = Quaff;"],
      ["computed static destructuring", 'const {["QBtn"]: Button} = Quaff;'],
      ["static Reflect.get", 'const Button = Reflect.get(Quaff, "QBtn");'],
      ["parenthesized namespace", "const Button = (Quaff).QBtn;"],
      ["TypeScript assertion", "const Button = (Quaff as typeof Quaff).QBtn;"],
      ["non-null assertion", "const Button = Quaff!.QBtn;"],
      [
        "function parameter shadow",
        "const Button = Quaff.QBtn; function inspect(Quaff) { return JSON.stringify(Quaff); }",
      ],
      ["block shadow", "const Button = Quaff.QBtn; {const Quaff = {}; consume(Quaff);}"],
      [
        "shadowed alias initializer",
        "const Button = Quaff.QBtn; function inspect(Quaff) { const registry = Quaff; return registry[name]; }",
      ],
      [
        "nested alias name reuse",
        "const registry = Quaff; const Button = registry.QBtn; function inspect(registry) { return registry[name]; }",
      ],
      [
        "catch parameter shadow",
        "const Button = Quaff.QBtn; try {} catch (Quaff) { consume(Quaff); }",
      ],
      [
        "for-loop binding shadow",
        "const Button = Quaff.QBtn; for (const Quaff of records) { consume(Quaff); }",
      ],
      ["class key", "const Button = Quaff.QBtn; class Record { Quaff() {} }"],
    ])("keeps only identified component CSS for %s", async (_, source) => {
      const usage = await analyzeSource(wrap(`${NAMESPACE_IMPORT}\n${source}`));
      expect(selectedComponents(usage.candidates)).toEqual(["QBtn"]);
    });

    it.each([
      ["unused namespace", NAMESPACE_IMPORT],
      [
        "type-only namespace",
        'import type * as Quaff from "@quaffui/quaff"; type Namespace = typeof Quaff;',
      ],
      ["type reference", `${NAMESPACE_IMPORT}\ntype Namespace = typeof Quaff;`],
      ["type-only export", `${NAMESPACE_IMPORT}\nexport type { Quaff };`],
      ["type-only export specifier", `${NAMESPACE_IMPORT}\nexport { type Quaff };`],
      ["line comment", `// ${NAMESPACE_IMPORT}\n// Quaff[name]`],
      ["block comment", `/* ${NAMESPACE_IMPORT}\nQuaff[name] */`],
      ["string literal", `const example = '${NAMESPACE_IMPORT} Quaff[name]';`],
      ["unrelated property", `${NAMESPACE_IMPORT}\nconst result = other.Quaff;`],
      ["unrelated key", `${NAMESPACE_IMPORT}\nconst result = {Quaff: true};`],
    ])("does not include component CSS for %s", async (_, source) => {
      const usage = await analyzeSource(wrap(source));
      expect(selectedComponents(usage.candidates)).toEqual([]);
    });
  });
}

describe("namespace binding names", () => {
  it.each(["元件", String.raw`Q\u0075aff`])(
    "detects %s without an ASCII-name restriction",
    async (name) => {
      const usage = await analyzeSource(
        `import * as ${name} from "@quaffui/quaff"; const Component = ${name}[selected];`
      );
      expect(selectedComponents(usage.candidates)).toEqual(COMPONENT_NAMES);
    }
  );
});

describe("Svelte namespace scopes", () => {
  it.each([
    [
      "const aliases stay in their own branch",
      `<script>${NAMESPACE_IMPORT} let {visible, name} = $props();</script>{#if visible}{@const registry = Quaff}{@const Component = registry[name]}<Component />{:else}{@const registry = {}}{JSON.stringify(registry)}{/if}`,
      COMPONENT_NAMES,
    ],
    [
      "script locals do not overwrite template aliases",
      `<script>${NAMESPACE_IMPORT} const registry = {}; let {visible, name} = $props();</script>{#if visible}{@const registry = Quaff}{@const Component = registry[name]}<Component />{/if}`,
      COMPONENT_NAMES,
    ],
    [
      "branch const shadows namespace locally",
      `<script>${NAMESPACE_IMPORT} const Button = Quaff.QBtn; let {row} = $props();</script>{#if row}{@const Quaff = row}{JSON.stringify(Quaff)}{/if}<Button />`,
      ["QBtn"],
    ],
    [
      "module namespace visible in instance",
      `<script module>${NAMESPACE_IMPORT}</script><script>const Component = Quaff[name];</script><Component />`,
      COMPONENT_NAMES,
    ],
    [
      "module namespace survives instance shadow",
      `<script module>${NAMESPACE_IMPORT} export const get = name => Quaff[name];</script><script>let {Quaff} = $props();</script>{Quaff}`,
      COMPONENT_NAMES,
    ],
    [
      "instance namespace shadows module local",
      `<script module>const Quaff = {};</script><script>${NAMESPACE_IMPORT} const Component = Quaff[name];</script><Component />`,
      COMPONENT_NAMES,
    ],
    [
      "markup uses instance shadow",
      `<script module>${NAMESPACE_IMPORT}</script><script>let {Quaff} = $props();</script>{JSON.stringify(Quaff)}`,
      [],
    ],
    [
      "each context shadows body",
      `<script>${NAMESPACE_IMPORT} const Button = Quaff.QBtn;</script>{#each rows as Quaff}{JSON.stringify(Quaff)}{/each}`,
      ["QBtn"],
    ],
    [
      "each expression keeps outer binding",
      String.raw`<script>${NAMESPACE_IMPORT}</script>{#each [Quaff["Q\u0042tn"]] as Quaff}<Quaff />{/each}`,
      ["QBtn"],
    ],
    [
      "each fallback keeps outer binding",
      `<script>${NAMESPACE_IMPORT}</script>{#each rows as Quaff}{JSON.stringify(Quaff)}{:else}{consume(Quaff)}{/each}`,
      COMPONENT_NAMES,
    ],
    [
      "snippet parameter shadow",
      `<script>${NAMESPACE_IMPORT} const Button = Quaff.QBtn;</script>{#snippet show(Quaff)}{JSON.stringify(Quaff)}{/snippet}`,
      ["QBtn"],
    ],
    [
      "await branch shadows body",
      `<script>${NAMESPACE_IMPORT} const Button = Quaff.QBtn;</script>{#await promise then Quaff}{JSON.stringify(Quaff)}{/await}`,
      ["QBtn"],
    ],
    [
      "await expression keeps outer binding",
      `<script>${NAMESPACE_IMPORT}</script>{#await consume(Quaff) then Quaff}{JSON.stringify(Quaff)}{/await}`,
      COMPONENT_NAMES,
    ],
  ])("resolves %s", async (_, source, expected) => {
    const usage = await analyzeSource(source);
    expect(selectedComponents(usage.candidates)).toEqual(expected);
  });
});

describe("other component imports", () => {
  it("does not expand Quaff CSS for an incomplete unrelated namespace import", async () => {
    const usage = await analyzeSource(
      '<script>import * as icons from "other-library"; const incomplete = ;</script>'
    );
    expect(selectedComponents(usage.candidates)).toEqual([]);
  });

  it("does not mistake Svelte examples in JS strings for real namespace imports", async () => {
    const source = `const example = '<script>${NAMESPACE_IMPORT} const Component = Quaff[name];</script>';`;
    const usage = await analyzeSource(source);
    expect(selectedComponents(usage.candidates)).toEqual([]);
  });

  it("handles closing-script text alongside a real static namespace use", async () => {
    const source = `${NAMESPACE_IMPORT} const tag = "</script>"; const Button = Quaff.QBtn;`;
    const usage = await analyzeSource(source);
    expect(selectedComponents(usage.candidates)).toEqual(["QBtn"]);
  });

  it.each([
    ['import {QBtn} from "@quaffui/quaff";', ["QBtn"]],
    ['import {QBtn as Button} from "@quaffui/quaff";', ["QBtn"]],
    ['import Button from "@quaffui/quaff/components/button/QBtn.svelte";', ["QBtn"]],
    ['export * from "@quaffui/quaff";', COMPONENT_NAMES],
    ['const library = await import("@quaffui/quaff");', COMPONENT_NAMES],
    [`#!/usr/bin/env node\n${NAMESPACE_IMPORT}\nconst Component = Quaff[name];`, COMPONENT_NAMES],
    [
      String.raw`import * as Q from "@quaffui/\u0071uaff"; const chosen = Q[name];`,
      COMPONENT_NAMES,
    ],
  ])("preserves detection for %s", async (source, expected) => {
    const usage = await analyzeSource(source);
    expect(selectedComponents(usage.candidates)).toEqual(expected);
  });

  it("recognizes a static namespace component in markup", async () => {
    const usage = await analyzeSource(`<script>${NAMESPACE_IMPORT}</script><Quaff.QBtn />`);
    expect(selectedComponents(usage.candidates)).toEqual(["QBtn"]);
  });

  it("finds namespace escapes in markup expressions", async () => {
    const usage = await analyzeSource(
      `<script>${NAMESPACE_IMPORT}</script><Renderer components={Quaff} />`
    );
    expect(selectedComponents(usage.candidates)).toEqual(COMPONENT_NAMES);
  });

  it("reuses root-layout parsing without changing its import information", async () => {
    const source = `<script>${NAMESPACE_IMPORT}\nimport "virtual:quaff.css"; const Button = Quaff.QBtn;</script><Button />`;
    const usage = await analyzeSource(source, true);
    expect(selectedComponents(usage.candidates)).toEqual(["QBtn"]);
    expect(usage.hasVirtualCssImport).toBe(true);
    expect(source.slice(usage.instanceScriptContentStart).startsWith(NAMESPACE_IMPORT)).toBe(true);
  });
});
