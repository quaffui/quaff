import { fileURLToPath } from "node:url";
import { compileString } from "sass";
import { PurgeCSS } from "purgecss";
import { describe, expect, it } from "vitest";

const CSS_DIRECTORY = new URL(".", import.meta.url);
const css = compileString('@use "base";', {
  loadPaths: [fileURLToPath(CSS_DIRECTORY)],
  importers: [
    {
      findFileUrl(url) {
        return url.startsWith("$css/") ? new URL(url.slice(5), CSS_DIRECTORY) : null;
      },
    },
  ],
}).css;

function readDeclarations(selector: string) {
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)].filter(([, selectors]) =>
    selectors.trim().split(/,\s*/).includes(selector)
  );

  expect(rules.length, selector).toBeGreaterThan(0);

  return Object.fromEntries(
    rules.flatMap(([, , body]) =>
      [...body.matchAll(/([\w-]+):\s*([^;]+);/g)].map(([, property, value]) => [property, value])
    )
  );
}

describe("CSS helpers", () => {
  it("uses the classes layer instead of important overrides", () => {
    const classesLayer = css.slice(css.indexOf("@layer classes {"));

    expect(classesLayer).toContain(".surface-container-low");
    expect(classesLayer).toContain(".column");
    expect(classesLayer).not.toContain("!important");
  });

  it("keeps grid rows and establishes standalone flex columns", () => {
    expect(readDeclarations(".row")).toMatchObject({ display: "grid" });
    expect(readDeclarations(".column")).toEqual({ display: "flex", "flex-direction": "column" });
    expect(readDeclarations(".flex")).toEqual({ display: "flex", "flex-wrap": "wrap" });
    expect(readDeclarations(".no-wrap")).toEqual({ "flex-wrap": "nowrap" });
    expect(readDeclarations(".column.reverse")).toEqual({ "flex-direction": "column-reverse" });
    expect(readDeclarations(".self-stretch")).toEqual({ "align-self": "stretch" });
  });

  it("uses canonical clipping and selection names while scrolling only when needed", () => {
    expect(css).not.toMatch(/\.no-(?:overflow|select)\b/);
    expect(readDeclarations(".overflow-hidden")).toEqual({ overflow: "hidden" });
    expect(readDeclarations(".no-scroll")).toEqual(readDeclarations(".overflow-hidden"));
    expect(readDeclarations(".non-selectable")).toMatchObject({ "user-select": "none" });
    expect(readDeclarations(".scroll")).toEqual({ overflow: "auto" });
    expect(readDeclarations(".scroll-x")).toEqual({ "overflow-x": "auto" });
    expect(readDeclarations(".scroll-y")).toEqual({ "overflow-y": "auto" });
  });

  it("fills the parent without clearing margins or changing shape", () => {
    expect(readDeclarations(".full-width")).toEqual({ width: "100%" });
    expect(readDeclarations(".full-height")).toEqual({ height: "100%" });
    expect(readDeclarations(".fit")).toEqual({ width: "100%", height: "100%" });
    expect(readDeclarations(".min-width-0")).toEqual({ "min-width": "0" });
    expect(readDeclarations(".absolute-full")).toEqual({ position: "absolute", inset: "0" });
  });

  it("keeps valid auto margins and shared gap sizes without emitting auto padding", () => {
    expect(css).not.toMatch(/\.q-p[trblxya]-auto\b/);
    expect(css).not.toMatch(/padding(?:-[\w-]+)?:\s*auto/);
    expect(readDeclarations(".q-ma-auto")).toEqual({ margin: "auto" });
    expect(readDeclarations(".q-mx-auto")).toEqual({ "margin-inline": "auto" });
    expect(readDeclarations(".q-pa-md")).toEqual({ padding: "16px" });
    expect(readDeclarations(".q-gap-md")).toEqual({ gap: "16px" });
    expect(readDeclarations(".q-gap-x-md")).toEqual({ "column-gap": "16px" });
    expect(readDeclarations(".q-gap-y-sm")).toEqual({ "row-gap": "8px" });
  });

  it("pairs every added M3 surface with on-surface text", () => {
    for (const role of [
      "surface-dim",
      "surface-bright",
      "surface-container-lowest",
      "surface-container-low",
      "surface-container",
      "surface-container-high",
      "surface-container-highest",
    ]) {
      expect(readDeclarations(`.${role}`)).toEqual({
        "background-color": `var(--${role})`,
        color: "var(--on-surface)",
      });
      expect(readDeclarations(`.bg-${role}`)).toEqual({ "background-color": `var(--${role})` });
      expect(readDeclarations(`.text-${role}`)).toEqual({ color: `var(--${role})` });
      expect(readDeclarations(`.border-${role}`)).toEqual({ "border-color": `var(--${role})` });
    }
  });

  it("uses contiguous M3 visibility ranges and the correct hidden size groups", () => {
    const visibilityCss = compileString('@use "classes/visibility";', {
      loadPaths: [fileURLToPath(CSS_DIRECTORY)],
    }).css;
    const mediaBlocks = visibilityCss.split(/(?=@media)/).slice(1, 6);
    const EXPECTED_RANGES = [
      [
        "(width >= 0px) and (width < 600px)",
        ["xs-hide", "sm", "md", "lg", "xl", "gt-xs", "gt-sm", "gt-md", "gt-lg"],
      ],
      [
        "(width >= 600px) and (width < 840px)",
        ["sm-hide", "xs", "md", "lg", "xl", "lt-sm", "gt-sm", "gt-md", "gt-lg"],
      ],
      [
        "(width >= 840px) and (width < 1200px)",
        ["md-hide", "xs", "sm", "lg", "xl", "lt-sm", "lt-md", "gt-md", "gt-lg"],
      ],
      [
        "(width >= 1200px) and (width < 1600px)",
        ["lg-hide", "xs", "sm", "md", "xl", "lt-sm", "lt-md", "lt-lg", "gt-lg"],
      ],
      [
        "(width >= 1600px)",
        ["xl-hide", "xs", "sm", "md", "lg", "lt-sm", "lt-md", "lt-lg", "lt-xl"],
      ],
    ] as const;

    expect(mediaBlocks).toHaveLength(EXPECTED_RANGES.length);

    for (const [index, [range, hiddenClasses]] of EXPECTED_RANGES.entries()) {
      expect(mediaBlocks[index]).toContain(`@media ${range}`);
      const classes = [...mediaBlocks[index].matchAll(/\.([\w-]+)/g)].map(([, name]) => name);

      expect(classes.sort()).toEqual([...hiddenClasses].sort());
    }
  });

  it("keeps used helpers through pruning without retaining unused surface roles", async () => {
    const [result] = await new PurgeCSS().purge({
      css: [{ raw: css }],
      content: [
        {
          extension: "html",
          raw: '<div class="column no-wrap gt-xs surface-container-low overflow-hidden q-gap-x-md"></div>',
        },
      ],
    });

    for (const selector of [
      ".column",
      ".no-wrap",
      ".gt-xs",
      ".surface-container-low",
      ".overflow-hidden",
      ".q-gap-x-md",
    ]) {
      expect(result.css).toContain(selector);
    }

    expect(result.css).not.toContain(".surface-container-highest");
    expect(result.css).not.toContain(".bg-surface-container-low");
  });
});
