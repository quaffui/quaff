import { describe, expect, it } from "vitest";
import { preprocess } from "svelte/compiler";
import { preprocessContext } from "../../../plugins/contextPreprocessor.js";

type Component = ReturnType<typeof createComponent>;

// rsvelte preprocesses every module script before any instance script.
const RSVELTE_SCRIPT_ORDER = [
  { scriptKey: "moduleScript", attributes: { module: true, lang: "ts" } },
  { scriptKey: "instanceScript", attributes: { lang: "ts" } },
] as const;

function createMarkup(moduleScript: string, instanceScript: string) {
  return `<script module lang="ts">${moduleScript}</script>\n\n<script lang="ts">${instanceScript}</script>\n`;
}

function createComponent(name: string) {
  const moduleScript = `
  import { QContext } from "#utils/context.js";

  interface ${name}Context {
    readonly disabled: boolean;
    open: boolean;
  }

  export const ${name}Ctx = QContext<${name}Context>("${name}");
`;
  const instanceScript = `
  let { disabled = false, open = $bindable(false) } = $props();

  ${name}Ctx.set({ disabled, open });
`;

  return {
    filename: `${name}.svelte`,
    moduleScript,
    instanceScript,
    markup: createMarkup(moduleScript, instanceScript),
  };
}

async function preprocessWithSvelte({ markup, filename }: Component) {
  const { code } = await preprocess(markup, [preprocessContext()], { filename });

  return code;
}

async function preprocessInRsvelteOrder(components: Component[]) {
  const { script } = preprocessContext();
  const processedComponents = components.map((component) => ({ ...component }));

  for (const { scriptKey, attributes } of RSVELTE_SCRIPT_ORDER) {
    for (const component of processedComponents) {
      const processed = await script?.({
        content: component[scriptKey],
        attributes,
        markup: component.markup,
        filename: component.filename,
      });

      component[scriptKey] = processed?.code ?? component[scriptKey];
    }
  }

  return processedComponents.map(({ moduleScript, instanceScript }) =>
    createMarkup(moduleScript, instanceScript)
  );
}

describe("context preprocessor", () => {
  it("turns context properties into getters and setters", async () => {
    const code = await preprocessWithSvelte(createComponent("group"));

    expect(code).toContain("get disabled()");
    expect(code).not.toContain("set disabled(");
    expect(code).toContain("get open()");
    expect(code).toContain("set open(");
  });

  it("does not depend on the order scripts of different files are preprocessed in", async () => {
    const components = [createComponent("tabs"), createComponent("list")];
    const expectedCodes = await Promise.all(components.map(preprocessWithSvelte));
    const codes = await preprocessInRsvelteOrder(components);

    expect(codes).toEqual(expectedCodes);
  });
});
