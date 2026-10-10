import { afterEach, describe, expect, it, vi } from "vitest";
import { DOCS_ASSET_OPTIONS } from "../../dev/docsAssets";
import {
  cleanupCssFixtures,
  createCssFixture,
  getCssAsset,
  hasSelector,
  readCssAsset,
} from "./cssFixture";
import type { QuaffAssetsOptions } from "../../lib/plugins/assets";

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();

  return {
    ...actual,
    readFile: (...args: Parameters<typeof actual.readFile>) => {
      const css = readCssAsset(args[0]);
      return css === undefined ? actual.readFile(...args) : Promise.resolve(css);
    },
  };
});

afterEach(cleanupCssFixtures);

function createComponentSource(...names: string[]) {
  return `<script>import { ${names.join(", ")} } from "@quaffui/quaff";</script>`;
}

function expectSelectors(css: string, present: string[], absent: string[] = []) {
  for (const selector of present) {
    expect(hasSelector(css, selector), `Missing ${selector}`).toBe(true);
  }

  for (const selector of absent) {
    expect(hasSelector(css, selector), `Unexpected ${selector}`).toBe(false);
  }
}

describe("component styles", () => {
  it("scans multiple source directories without including unrelated library code", async () => {
    const fixture = await createCssFixture(
      {
        "routes/Page.svelte": createComponentSource("QBtn"),
        "docs/Example.svelte": createComponentSource("QCard"),
        "lib/Unused.svelte": createComponentSource("QTable"),
      },
      { sourceDir: ["src/routes", "src/docs", "src/routes"] }
    );

    expectSelectors(await fixture.getStylesheet(), [".q-btn", ".q-card"], [".q-table"]);

    await fixture.update("docs/Example.svelte", createComponentSource("QChip"));
    expectSelectors(await fixture.getStylesheet(), [".q-btn", ".q-chip"], [".q-card", ".q-table"]);
  });

  it.each([
    {
      component: "QIconBtn",
      selectors: [".q-icon-btn", ".q-btn", ".q-icon", ".q-circular-progress"],
    },
    {
      component: "QSelect",
      selectors: [
        ".q-select__menu",
        ".q-field",
        ".q-list",
        ".q-item",
        ".q-menu",
        ".q-icon",
        ".q-separator",
      ],
    },
    {
      component: "QDate",
      selectors: [".q-date__picker", ".q-dialog", ".q-menu", ".q-field", ".q-btn", ".q-icon"],
    },
    {
      component: "QColorPicker",
      selectors: [".q-color-picker", ".q-field", ".q-slider", ".q-menu", ".q-btn", ".q-btn-group"],
    },
    {
      component: "QNavGroup",
      selectors: [".q-expansion-item", ".q-list", ".q-item", ".q-icon-btn"],
    },
    { component: "Notify", selectors: [".q-snackbar", ".q-btn", ".q-icon-btn"] },
  ])("includes the styles rendered by $component", async ({ component, selectors }) => {
    const fixture = await createCssFixture({ "App.svelte": createComponentSource(component) });
    expectSelectors(await fixture.getStylesheet(), selectors, [".q-table", ".q-carousel"]);
  });

  it.each([
    'import { QBtn as Button } from "@quaffui/quaff";',
    'import * as Kit from "@quaffui/quaff"; const Button = Kit.QBtn;',
    'import * as Kit from "@quaffui/quaff"; const Button = Kit.QBtn; function serialize(Kit) { return JSON.stringify(Kit); }',
    'import * as Kit from "@quaffui/quaff"; const UI = Kit; const Button = UI.QBtn;',
  ])("keeps static import forms equally small: %s", async (source) => {
    const baseline = await createCssFixture({ "App.svelte": createComponentSource("QBtn") });
    const fixture = await createCssFixture({ "components.ts": source });
    expect(await fixture.getStylesheet()).toBe(await baseline.getStylesheet());
  });

  it("retains all component styles when a namespace alias selects dynamically", async () => {
    const fixture = await createCssFixture({
      "components.ts":
        'import * as Kit from "@quaffui/quaff"; const UI = Kit; const Component = UI[window.selectedComponent];',
    });
    expectSelectors(await fixture.getStylesheet(), [
      ".q-btn",
      ".q-date__picker",
      ".q-table",
      ".q-carousel",
    ]);
  });

  it("keeps shared styles once in cascade order regardless of import order", async () => {
    const fixture = await createCssFixture({
      "App.svelte": createComponentSource("QMenu", "QIcon", "QIconBtn", "QSplitBtn", "QBtn"),
      "Other.svelte": createComponentSource("QSplitBtn", "QBtn"),
    });
    const css = await fixture.getStylesheet();
    const SHEETS = ["button", "split-button", "icon", "menu", "progress"];
    const positions = SHEETS.map((name) => {
      const asset = getCssAsset(`components/${name}`);
      expect(css.split(asset)).toHaveLength(2);
      return css.indexOf(asset);
    });
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it.each(["q-btn", "q-btn__label", "q-btn--filled"])(
    "recognizes the component family from a literal %s class",
    async (className) => {
      const fixture = await createCssFixture({ "App.svelte": `<div class="${className}"></div>` });
      expectSelectors(await fixture.getStylesheet(), [".q-btn"], [".q-table"]);
    }
  );
});

describe("optional pruning", () => {
  it("keeps API heading spacing from generated docs outside the scanned directories", async () => {
    const fixture = await createCssFixture(
      {
        "routes/+page.svelte": '<script>import heading from "../lib/docs";</script>{@html heading}',
        "docs/Api.svelte": "<div>API</div>",
        "lib/docs.ts": "export default '<span class=\"q-mr-xs\">value</span>';",
      },
      DOCS_ASSET_OPTIONS
    );

    expectSelectors(await fixture.getStylesheet(), [".q-mr-xs"], [".q-mr-xl"]);
  });

  it.each([false, true])(
    "retains complete component sheets with stripUnused=%s",
    async (stripUnused) => {
      const fixture = await createCssFixture(
        { "App.svelte": createComponentSource("QBtn") },
        { css: { stripUnused } }
      );
      const css = await fixture.getStylesheet();
      expect(css).toContain(getCssAsset("components/button"));
      expectSelectors(css, [".q-ripple__effect", ".q-ripple--center .q-ripple"]);
      expect(css).toMatch(/@keyframes ripple\s*\{/);
      expect(hasSelector(css, ".q-pa-xl")).toBe(!stripUnused);
      expectSelectors(css, [], [".q-table", ".q-railbar"]);
    }
  );

  it.each([
    { component: "QBreadcrumbsEl", helpers: [".q-px-none", ".q-px-sm", ".q-px-md", ".q-px-lg"] },
    {
      component: "QCardActions",
      helpers: [
        ".flex",
        ".items-start",
        ".items-center",
        ".items-end",
        ".justify-between",
        ".justify-evenly",
      ],
    },
    { component: "QList", helpers: [".q-py-sm"] },
    { component: "QSeparator", helpers: [".q-px-sm", ".q-py-sm"] },
    { component: "QCircularProgress", helpers: [".absolute-full", ".flex", ".flex-center"] },
    {
      component: "QCodeBlock",
      helpers: [
        ".q-pb-sm",
        ".q-ma-none",
        ".text-primary",
        ".text-error",
        ".text-green",
        ".border-green",
      ],
    },
  ])("preserves internal utility classes for $component", async ({ component, helpers }) => {
    const fixture = await createCssFixture(
      { "App.svelte": createComponentSource(component) },
      { css: { stripUnused: true } }
    );
    expectSelectors(await fixture.getStylesheet(), helpers, [".q-pa-xl", ".q-table"]);
  });

  it.each([false, true])("includes grid helpers only when used: %s", async (grid) => {
    const markup = grid
      ? '<QCardSection horizontal class="q-gutter-sm"><div class="col-6"></div></QCardSection>'
      : "<QCardSection horizontal>Content</QCardSection>";
    const fixture = await createCssFixture(
      { "App.svelte": createComponentSource("QCardSection") + markup },
      { css: { stripUnused: true } }
    );
    const css = await fixture.getStylesheet();
    expectSelectors(css, [".row"], [".row > .col-12", ".row.q-gutter-xl"]);
    expect(hasSelector(css, ".row > .col-6")).toBe(grid);
    expect(hasSelector(css, ".row.q-gutter-sm")).toBe(grid);
  });

  it("keeps helpers of descendants without loading unrelated components", async () => {
    const fixture = await createCssFixture(
      { "App.svelte": createComponentSource("QBtn") },
      { css: { stripUnused: true } }
    );
    expectSelectors(
      await fixture.getStylesheet(),
      [".absolute-full", ".flex-center"],
      [".q-px-lg", ".q-railbar"]
    );
  });
});

describe("explicit CSS selection", () => {
  it.each([
    { options: { include: ["QSelect"] }, selectors: [".q-select__menu", ".q-field", ".q-menu"] },
    { options: { include: ["Notify"] }, selectors: [".q-snackbar", ".q-btn"] },
    {
      options: { css: { safelist: ["text-primary", /^q-pa-/] } },
      selectors: [".text-primary", ".q-pa-sm", ".q-pa-xl"],
    },
    {
      options: { css: { safelist: { standard: ["text-primary"], greedy: [/^q-avatar/] } } },
      selectors: [".text-primary", ".q-avatar"],
    },
  ] satisfies { options: QuaffAssetsOptions; selectors: string[] }[])(
    "supports $options without source references",
    async ({ options, selectors }) => {
      const fixture = await createCssFixture(
        {},
        { ...options, css: { ...options.css, stripUnused: true } }
      );
      expectSelectors(await fixture.getStylesheet(), selectors, [".q-table"]);
    }
  );

  it("can exclude a directly requested component", async () => {
    const fixture = await createCssFixture(
      { "App.svelte": createComponentSource("QBtn", "QTable") },
      { exclude: ["QTable"] }
    );
    expectSelectors(await fixture.getStylesheet(), [".q-btn"], [".q-table", ".q-select__menu"]);
  });
});

describe("source updates", () => {
  it("replaces removed styles while retaining shared dependencies", async () => {
    const fixture = await createCssFixture(
      {
        "App.svelte": createComponentSource("QBtn"),
        "Other.svelte": createComponentSource("QIconBtn"),
      },
      { css: { stripUnused: true } }
    );
    await fixture.getStylesheet();

    expect(await fixture.update("App.svelte", createComponentSource("QSelect"))).toBe(true);
    expectSelectors(await fixture.getStylesheet(), [".q-btn", ".q-select__menu", ".q-menu"]);
    expect(await fixture.remove("Other.svelte")).toBe(true);
    expectSelectors(
      await fixture.getStylesheet(),
      [".q-select__menu", ".q-icon"],
      [".q-btn", ".q-circular-progress"]
    );
    expect(await fixture.update("App.svelte", createComponentSource("QSelect"))).toBe(false);
    expect(await fixture.remove("App.svelte")).toBe(true);
    expectSelectors(
      await fixture.getStylesheet(),
      [],
      [".q-select__menu", ".q-icon", ".q-ripple__effect"]
    );
  });
});
