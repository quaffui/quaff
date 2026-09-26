import { fileURLToPath } from "node:url";
import { compileString } from "sass";
import { describe, expect, it } from "vitest";

// M3 Roboto (3P, Web, Static): sizes, line heights and tracking in px at a 16px root.
// https://m3.material.io/styles/typography/type-scale-tokens
// role, family, size, line height, tracking, standard weight, emphasized weight
const SPEC = [
  ["display-large", "brand", 57, 64, -0.25, 400, 500],
  ["display-medium", "brand", 45, 52, 0, 400, 500],
  ["display-small", "brand", 36, 44, 0, 400, 500],
  ["headline-large", "brand", 32, 40, 0, 400, 500],
  ["headline-medium", "brand", 28, 36, 0, 400, 500],
  ["headline-small", "brand", 24, 32, 0, 400, 500],
  ["title-large", "brand", 22, 28, 0, 400, 500],
  ["title-medium", "plain", 16, 24, 0.15, 500, 700],
  ["title-small", "plain", 14, 20, 0.1, 500, 700],
  ["body-large", "plain", 16, 24, 0.5, 400, 500],
  ["body-medium", "plain", 14, 20, 0.25, 400, 500],
  ["body-small", "plain", 12, 16, 0.4, 400, 500],
  ["label-large", "plain", 14, 20, 0.1, 500, 700],
  ["label-medium", "plain", 12, 16, 0.5, 500, 700],
  ["label-small", "plain", 11, 16, 0.5, 500, 700],
] as const;

const SASS_OPTIONS = { loadPaths: [fileURLToPath(new URL(".", import.meta.url))] };

const css = compileString(
  `@use "theme/typography-variables";
   @use "theme/typography-classes";
   @use "classes/typography" as emphasized;
   @use "theme/typography";`,
  SASS_OPTIONS
).css;

function declarations(selector: string): Record<string, string> {
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

function rem(px: number) {
  return px === 0 ? "0" : `${px / 16}rem`;
}

describe("Material type scale", () => {
  it("emits all 15 emphasized styles with the specified weight and tracking", () => {
    const tokens = declarations(":root");

    for (const [role, family, size, height, tracking, , weight] of SPEC) {
      const prefix = `--typescale-${role}-emphasized`;

      expect(tokens).toMatchObject({
        [`${prefix}-font-family-name`]: `var(--typescale-font-family-${family})`,
        [`${prefix}-font-family-style`]: "normal",
        [`${prefix}-font-weight`]: String(weight),
        [`${prefix}-font-size`]: rem(size),
        [`${prefix}-line-height`]: rem(height),
        [`${prefix}-letter-spacing`]: rem(tracking),
      });
    }
  });

  it("keeps emphasized utilities separate from theme defaults with their own tokens", () => {
    const themeCss = compileString('@use "theme/typography-classes";', SASS_OPTIONS).css;

    expect(themeCss).not.toContain("-emphasized");

    for (const [role] of SPEC) {
      const prefix = `--typescale-${role}-emphasized`;

      expect(declarations(`.${role}-emphasized`)).toEqual({
        "font-family": `var(${prefix}-font-family-name)`,
        "font-style": `var(${prefix}-font-family-style)`,
        "font-weight": `var(${prefix}-font-weight)`,
        "font-size": `var(${prefix}-font-size)`,
        "line-height": `var(${prefix}-line-height)`,
        "letter-spacing": `var(${prefix}-letter-spacing)`,
      });
    }
  });

  it("keeps standard styles, headings and legacy aliases unchanged", () => {
    const tokens = declarations(":root");

    for (const [role, , size, height, tracking, weight] of SPEC) {
      expect(tokens).toMatchObject({
        [`--typescale-${role}-font-weight`]: String(weight),
        [`--typescale-${role}-font-size`]: rem(size),
        [`--typescale-${role}-line-height`]: rem(height),
        [`--typescale-${role}-letter-spacing`]: rem(tracking),
      });
      expect(declarations(`.${role}`)["font-weight"]).toBe(`var(--typescale-${role}-font-weight)`);
    }

    for (const [index, [role]] of SPEC.slice(0, 6).entries()) {
      expect(declarations(`h${index + 1}`)["font-weight"]).toBe(
        `var(--typescale-${role}-font-weight)`
      );
      expect(declarations(`.text-h${index + 1}`)).toEqual(declarations(`.${role}`));
    }

    expect(declarations("body")).toEqual(declarations(".body-medium"));
    expect(declarations(".text-subtitle1")).toEqual(declarations(".title-medium"));
    expect(declarations(".text-subtitle2")).toEqual(declarations(".title-small"));
    expect(declarations(".text-body1")).toEqual(declarations(".body-large"));
    expect(declarations(".text-body2")).toEqual(declarations(".body-medium"));
    expect(declarations(".text-caption")).toEqual(declarations(".body-small"));
    expect(declarations(".text-overline")).toEqual({
      ...declarations(".label-medium"),
      "text-transform": "uppercase",
    });
    expect(tokens["--typescale-label-large-font-weight-prominent"]).toBe("700");
    expect(tokens["--typescale-label-medium-font-weight-prominent"]).toBe("700");
  });
});
