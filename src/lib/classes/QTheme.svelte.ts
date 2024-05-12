import { generateColors } from "$lib/utils/colors";
import type { HexValue, QuaffColors } from "$lib/utils/colors";

type Mode = "light" | "dark";
type ThemeColors = Record<`${keyof QuaffColors}-${Mode}`, HexValue>;

function extractColorFromCssVar(cssVar: string) {
  const rootStyles = getComputedStyle(document.documentElement);
  const varName = cssVar.replace(/var\(([a-z0-9-]+)\)/, "$1"); // remove var(...) to get only the color
  return rootStyles.getPropertyValue(varName).trim();
}

function prepareThemeColors(from: string) {
  if (from.startsWith("var(")) {
    from = extractColorFromCssVar(from);
  }

  const theme = generateColors(from);

  console.log(theme);

  //@ts-expect-error The properties are added in the next for loop
  const themeColors: ThemeColors = {};

  let mode: "light" | "dark";
  for (mode in theme) {
    let color: keyof QuaffColors;
    for (color in theme[mode]) {
      const cssColor: keyof typeof themeColors = `${color}-${mode}`;
      themeColors[cssColor] = theme[mode][color];
    }
  }

  return themeColors;
}

class QTheme {
  themeColors = $state({} as ThemeColors);

  constructor() {
    this.themeColors = prepareThemeColors("#0039b4");
  }

  private apply() {
    const root = document.documentElement;
    if (root === null) {
      return;
    }

    let colorName: keyof ThemeColors;
    for (colorName in this.themeColors) {
      root.style.setProperty(`--${colorName}`, this.themeColors[colorName]);
    }
  }

  updateThemeColor(color: keyof ThemeColors, newVal: HexValue) {
    this.themeColors[color] = newVal;
  }

  setTheme(from: string) {
    console.log({ from });
    const newTheme = prepareThemeColors(from);
    this.themeColors = newTheme;
    this.apply();
  }
}

export default new QTheme();
