import { generateColors, type HexValue, type Mode, type QuaffColors } from "$utils";

type ThemeColor = keyof QuaffColors;
type ThemeColorKey = `${ThemeColor}-${Mode}`;
type ThemeColors = Record<ThemeColorKey, HexValue>;

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

  let mode: Mode;
  for (mode in theme) {
    let color: ThemeColor;
    for (color in theme[mode]) {
      themeColors[`${color}-${mode}`] = theme[mode][color];
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

  private apply(colors: Partial<ThemeColors> = this.themeColors) {
    const root = document.documentElement;
    const colorNames = new Set(
      (Object.keys(colors) as ThemeColorKey[]).map(
        (color) => color.replace(/-(?:light|dark)$/, "") as ThemeColor
      )
    );

    for (const color of colorNames) {
      root.style.setProperty(
        `--${color}`,
        `light-dark(${this.themeColors[`${color}-light`]}, ${this.themeColors[`${color}-dark`]})`
      );
    }
  }

  updateThemeColor(color: keyof ThemeColors, newVal: HexValue) {
    this.themeColors[color] = newVal;
    this.apply({ [color]: newVal });
  }

  updateThemeColors(colors: Partial<ThemeColors>) {
    let colorName: keyof ThemeColors;
    for (colorName in colors) {
      const color = colors[colorName];

      if (color) {
        this.themeColors[colorName] = color;
      }
    }

    this.apply(colors);
  }

  setTheme(from: string) {
    const newTheme = prepareThemeColors(from);
    this.themeColors = newTheme;
    this.srcColor = from;
    this.apply();
  }
}

export default new QTheme();
