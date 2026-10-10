import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_THEME_COLORS, DEFAULT_THEME_SOURCE_COLOR } from "$internal/defaultTheme";
import { generateColors } from "$utils";
import { generateColors as calculateColors, type HexValue } from "../utils/colors";
import { convertCase } from "../utils/string";

vi.mock("$utils", async (importOriginal) => {
  const utils = await importOriginal<typeof import("$utils")>();
  return { ...utils, generateColors: vi.fn(utils.generateColors) };
});

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

afterEach(() => vi.unstubAllGlobals());

describe("theme defaults", () => {
  it("matches the generated stylesheet and the current color algorithm", async () => {
    const stylesheet = await readFile(
      new URL("../css/theme/_colors.scss", import.meta.url),
      "utf8"
    );
    const colors = calculateColors({ sourceColor: DEFAULT_THEME_SOURCE_COLOR });
    const expected: Record<string, HexValue> = {};

    for (const name of Object.keys(colors.light) as (keyof typeof colors.light)[]) {
      const light = colors.light[name];
      const dark = colors.dark[name];
      expected[`${name}Light`] = light;
      expected[`${name}Dark`] = dark;
      expect(stylesheet).toContain(
        `--${convertCase(name, "camel", "kebab")}: light-dark(${light}, ${dark});`
      );
    }

    expect(DEFAULT_THEME_COLORS).toEqual(expected);
  });

  it("skips startup calculation but still applies custom themes synchronously", async () => {
    const { default: theme } = await import("./QTheme.svelte");
    const setProperty = vi.fn();
    vi.stubGlobal("document", { documentElement: { style: { setProperty } } });

    expect(generateColors).not.toHaveBeenCalled();
    expect(theme.srcColor).toBe(DEFAULT_THEME_SOURCE_COLOR);
    expect(theme.themeColors).toEqual(DEFAULT_THEME_COLORS);

    theme.setTheme("#b42d00");

    const expected = calculateColors({ sourceColor: "#b42d00" });
    expect(generateColors).toHaveBeenCalledOnce();
    expect(theme.srcColor).toBe("#b42d00");
    expect(theme.themeColors.primaryLight).toBe(expected.light.primary);
    expect(theme.themeColors.primaryDark).toBe(expected.dark.primary);
    expect(setProperty).toHaveBeenCalledWith(
      "--primary",
      `light-dark(${expected.light.primary}, ${expected.dark.primary})`
    );
  });

  it("keeps edits separate from the shared default palette", async () => {
    const { default: theme } = await import("./QTheme.svelte");
    const { DEFAULT_THEME_COLORS: defaultColors } = await import("$internal/defaultTheme");
    vi.stubGlobal("document", { documentElement: { style: { setProperty: vi.fn() } } });
    const originalPrimary = defaultColors.primaryLight;

    theme.updateThemeColor("primaryLight", "#123456");

    expect(theme.themeColors.primaryLight).toBe("#123456");
    expect(defaultColors.primaryLight).toBe(originalPrimary);
  });
});
