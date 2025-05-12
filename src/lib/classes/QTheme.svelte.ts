import { generateColors, type HexValue, type QuaffColors, type Mode } from "$utils";

type ThemeColors = Record<`${keyof QuaffColors}-${Mode}`, HexValue>;

function extractColorFromCssVar(cssVar: string) {
  const rootStyles = getComputedStyle(document.documentElement);
  // remove var(...) to get only the color
  const varName = cssVar.replace(/var\(([a-z0-9-]+)\)/, "$1");
  return rootStyles.getPropertyValue(varName).trim();
}

function prepareThemeColors(from: string) {
  if (from.startsWith("var(")) {
    from = extractColorFromCssVar(from);
  }

  const theme = generateColors(from);

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
  srcColor = $state("#0039b4");

  constructor() {
    this.themeColors = prepareThemeColors(this.srcColor);
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
    this.apply();
  }

  updateThemeColors(colors: Partial<ThemeColors>) {
    let colorName: keyof ThemeColors;
    for (colorName in colors) {
      const color = colors[colorName];

      if (color) {
        this.themeColors[colorName] = color;
      }
    }

    this.apply();
  }

  setTheme(from: string) {
    const newTheme = prepareThemeColors(from);
    this.themeColors = newTheme;
    this.srcColor = from;
    this.apply();
  }
}

export default new QTheme();
