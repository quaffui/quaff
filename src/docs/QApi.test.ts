import { describe, expect, it } from "vitest";
import { getOwnTypeDefinition } from "./QApi.utils";

describe("QApi type definition lookup", () => {
  it("only resolves definitions owned by the current component document", () => {
    const inherited = { SharedType: "type SharedType = 'wrong';" };
    const definitions: Record<string, string> = Object.assign(Object.create(inherited), {
      SharedType: "type SharedType = 'current';",
      CurrentType: "type CurrentType = string;",
    });

    expect(getOwnTypeDefinition(definitions, "SharedType")).toBe("type SharedType = 'current';");
    expect(getOwnTypeDefinition(definitions, "CurrentType")).toBe("type CurrentType = string;");

    delete definitions.SharedType;

    expect(getOwnTypeDefinition(definitions, "SharedType")).toBeUndefined();
  });
});
