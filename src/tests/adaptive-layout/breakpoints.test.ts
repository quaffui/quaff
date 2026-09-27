import { describe, expect, it } from "vitest";
import { resolveScreen } from "$internal/breakpoints";

describe("MD3 layout recommendations", () => {
  it.each([
    [0, "navbar", false],
    [599.5, "navbar", false],
    [600, "railbar", false],
    [839.5, "railbar", false],
    [840, "railbar", true],
    [1200, "railbar", true],
    [1600, "railbar", true],
  ] as const)("adapts navigation and list/detail at %s px", (width, navigation, twoPane) => {
    const state = resolveScreen(width);

    expect(state.navigation).toBe(navigation);
    expect(state.twoPane).toBe(twoPane);
  });
});

describe("screen state", () => {
  it.each([
    [0, "xs", ["sm", "md", "lg", "xl"], []],
    [599.5, "xs", ["sm", "md", "lg", "xl"], []],
    [600, "sm", ["md", "lg", "xl"], ["xs"]],
    [839.5, "sm", ["md", "lg", "xl"], ["xs"]],
    [840, "md", ["lg", "xl"], ["xs", "sm"]],
    [1199.5, "md", ["lg", "xl"], ["xs", "sm"]],
    [1200, "lg", ["xl"], ["xs", "sm", "md"]],
    [1599.5, "lg", ["xl"], ["xs", "sm", "md"]],
    [1600, "xl", [], ["xs", "sm", "md", "lg"]],
    [2560, "xl", [], ["xs", "sm", "md", "lg"]],
  ] as const)("exposes size and comparison flags at %s px", (width, name, lt, gt) => {
    const screen = resolveScreen(width, 720);

    expect(screen.ready).toBe(true);
    expect(screen.width).toBe(width);
    expect(screen.height).toBe(720);
    expect(screen.name).toBe(name);
    expect([screen.xs, screen.sm, screen.md, screen.lg, screen.xl].filter(Boolean)).toHaveLength(1);
    expect(screen[name]).toBe(true);
    expect(
      Object.entries(screen.lt)
        .filter(([, active]) => active)
        .map(([key]) => key)
    ).toEqual(lt);
    expect(
      Object.entries(screen.gt)
        .filter(([, active]) => active)
        .map(([key]) => key)
    ).toEqual(gt);
  });

  it("exposes fixed MD3 size thresholds", () => {
    const screen = resolveScreen(840, 720);

    expect(screen.sizes).toEqual({ sm: 600, md: 840, lg: 1200, xl: 1600 });
    expect(Object.isFrozen(screen.sizes)).toBe(true);
  });

  it.each([undefined, NaN, Infinity, -1])("uses a compact fallback for width %s", (width) => {
    const screen = resolveScreen(width);

    expect(screen.ready).toBe(false);
    expect(screen.width).toBe(0);
    expect(screen.height).toBe(0);
    expect(screen.name).toBe("xs");
    expect(screen.xs).toBe(true);
    expect([screen.sm, screen.md, screen.lg, screen.xl]).toEqual([false, false, false, false]);
    expect(screen.lt).toEqual({ sm: true, md: true, lg: true, xl: true });
    expect(screen.gt).toEqual({ xs: false, sm: false, md: false, lg: false });
    expect(screen.navigation).toBe("navbar");
    expect(screen.twoPane).toBe(false);
  });

  it.each([undefined, NaN, Infinity, -1])(
    "defaults height %s to zero without changing the width class",
    (height) => {
      const screen = resolveScreen(840, height);

      expect(screen.ready).toBe(true);
      expect(screen.height).toBe(0);
      expect(screen.name).toBe("md");
      expect(screen.twoPane).toBe(true);
    }
  );
});
