import { readFile } from "node:fs/promises";
import ts from "typescript";
import { expect, it } from "vitest";
import { QUAFF_COMPONENT_NAMES } from "./autoImports.js";

it("keeps auto-imports aligned with the public components", async () => {
  const contents = await readFile(new URL("./components/index.ts", import.meta.url), "utf8");
  const source = ts.createSourceFile("index.ts", contents, ts.ScriptTarget.Latest);
  const exportedNames = source.statements.flatMap((statement) => {
    if (!ts.isExportDeclaration(statement) || !statement.exportClause) {
      return [];
    }

    if (!ts.isNamedExports(statement.exportClause)) {
      return [];
    }

    return statement.exportClause.elements.map(({ name }) => name.text);
  });

  expect(QUAFF_COMPONENT_NAMES.toSorted()).toEqual(exportedNames.toSorted());
});
