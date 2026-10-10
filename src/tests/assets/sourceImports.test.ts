import { describe, expect, it } from "vitest";
import { collectSourceImports } from "../../lib/plugins/assets/sourceImports.js";

describe("server source dependencies", () => {
  it("collects runtime dependencies from scripts and template expressions", async () => {
    const imports = await collectSourceImports(`
      <script module lang="ts">
        export * from "./exports";
        export { Report } from "./reports";
      </script>
      <script lang="ts">
        import Card from "./Card.svelte";
        const first = import("./First.svelte");
        const second = import(\`./Second.svelte\`);
      </script>
      <p>{import("./TemplateOnly.svelte")}</p>
      <style lang="scss">$color: red; p { color: $color; }</style>
    `);

    expect(imports).toEqual(
      new Set([
        "./exports",
        "./reports",
        "./Card.svelte",
        "./First.svelte",
        "./Second.svelte",
        "./TemplateOnly.svelte",
      ])
    );
  });

  it("ignores type dependencies while traversing runtime TypeScript expressions", async () => {
    const imports = await collectSourceImports(`
      import type Card from "./TypeCard.svelte";
      import { type Props } from "./props";
      export type { Config } from "./config";
      export { type Settings } from "./settings";
      type Report = typeof import("./TypeReport.svelte");
      import { type Data, render } from "./renderer";
      export { type Result, submit } from "./actions";
      namespace Reports {
        export const load = import("./Report.svelte") as Promise<unknown>;
      }
      class Preview {
        constructor(public report = import("./Preview.svelte")) {}
      }
    `);

    expect(imports).toEqual(
      new Set(["./renderer", "./actions", "./Report.svelte", "./Preview.svelte"])
    );
  });

  it("requires conservative handling for unresolved runtime dependencies or unsupported syntax", async () => {
    for (const source of [
      "import(reportPath)",
      'import.meta.glob("./*.svelte")',
      'import.meta["globEager"]("./*.svelte")',
      '<p>{import.meta.glob("./*.svelte", { eager: true })}</p>',
      "import {",
    ]) {
      expect(await collectSourceImports(source), source).toBeUndefined();
    }
  });
});
