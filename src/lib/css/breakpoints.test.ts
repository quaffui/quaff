import { fileURLToPath } from "node:url";
import { compileString } from "sass";
import { describe, expect, it } from "vitest";
import { BREAKPOINTS } from "../internal/breakpoints";

const CSS_DIRECTORY = fileURLToPath(new URL(".", import.meta.url));

function compileStyle(source: string) {
  return compileString(source, { loadPaths: [CSS_DIRECTORY] }).css;
}

function mediaQueries(css: string) {
  return [...css.matchAll(/@media\s+([^{}]+)/g)].map((match) => match[1].trim());
}

describe("breakpoint styles", () => {
  it("keeps Sass thresholds aligned with JavaScript", () => {
    const css = compileStyle(`
      @use "variables";
      .thresholds {
        @each $name, $width in variables.$breakpoints {
          --#{$name}: #{$width};
        }
      }
    `);
    const thresholds = Object.fromEntries(
      [...css.matchAll(/--(\w+):\s*(\d+)px/g)].map(([, name, width]) => [name, Number(width)])
    );

    expect(thresholds).toEqual(BREAKPOINTS);
  });

  it("covers every size without gaps at fractional widths", () => {
    const css = compileStyle(`
      @use "mixins/responsive";
      .xs { @include responsive.xs { color: red; } }
      .sm { @include responsive.sm { color: red; } }
      .md { @include responsive.md { color: red; } }
      .lg { @include responsive.lg { color: red; } }
      .xl { @include responsive.xl { color: red; } }
    `);

    expect(mediaQueries(css)).toEqual([
      `only screen and (width < ${BREAKPOINTS.sm}px)`,
      `only screen and (min-width: ${BREAKPOINTS.sm}px) and (width < ${BREAKPOINTS.md}px)`,
      `only screen and (min-width: ${BREAKPOINTS.md}px) and (width < ${BREAKPOINTS.lg}px)`,
      `only screen and (min-width: ${BREAKPOINTS.lg}px) and (width < ${BREAKPOINTS.xl}px)`,
      `only screen and (min-width: ${BREAKPOINTS.xl}px)`,
    ]);
  });

  it("uses exclusive upper limits for every up-to mixin", () => {
    const css = compileStyle(`
      @use "mixins/responsive";
      .sm { @include responsive.up-to-sm { color: red; } }
      .md { @include responsive.up-to-md { color: red; } }
      .lg { @include responsive.up-to-lg { color: red; } }
      .xl { @include responsive.up-to-xl { color: red; } }
    `);

    expect(mediaQueries(css)).toEqual(
      [BREAKPOINTS.sm, BREAKPOINTS.md, BREAKPOINTS.lg, BREAKPOINTS.xl].map(
        (width) => `only screen and (width < ${width}px)`
      )
    );
  });

  it("applies the same grid column boundaries without configuration", () => {
    const css = compileStyle('@use "classes/grid";');
    const columns = [
      ...css.matchAll(
        /@media\s+\(min-width:\s*(\d+)px\)\s*\{\s*\.row\s*>\s*\.col-(\w+)-1\s*\{\s*grid-column:\s*span\s+1/g
      ),
    ].map(([, width, name]) => [name, Number(width)]);

    expect(columns).toEqual(Object.entries(BREAKPOINTS));
    expect(mediaQueries(css)).toHaveLength(Object.keys(BREAKPOINTS).length);
  });

  it("changes page spacing at the shared small and large boundaries", () => {
    const css = compileStyle('@use "theme/page";');

    expect(mediaQueries(css)).toEqual([
      `only screen and (min-width: ${BREAKPOINTS.sm}px)`,
      `only screen and (min-width: ${BREAKPOINTS.lg}px)`,
    ]);
    expect(css).toMatch(/padding-inline:\s*16px/);
    expect(css).toMatch(/padding-inline:\s*24px/);
    expect(css).toMatch(/padding-block:\s*24px/);
    expect(css).toMatch(/padding-block:\s*32px/);
  });
});
