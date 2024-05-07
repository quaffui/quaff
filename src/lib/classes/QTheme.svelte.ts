import materialDynamicColors from "material-dynamic-colors";
import QColors from "$lib/utils/colors";
import type {
  IMaterialDynamicColorsTheme,
  IMaterialDynamicColorsThemeColor,
} from "material-dynamic-colors/src/cdn/interfaces";
import { convertCase } from "$lib/utils/string";

interface MaterialColors {
  primary: string;
  "on-primary": string;
  "primary-container": string;
  "on-primary-container": string;
  secondary: string;
  "on-secondary": string;
  "secondary-container": string;
  "on-secondary-container": string;
  tertiary: string;
  "on-tertiary": string;
  "tertiary-container": string;
  "on-tertiary-container": string;
  error: string;
  "error-container": string;
  "on-error": string;
  "on-error-container": string;
  background: string;
  "on-background": string;
  surface: string;
  "on-surface": string;
  "surface-variant": string;
  "on-surface-variant": string;
  outline: string;
  "inverse-on-surface": string;
  "inverse-surface": string;
  "inverse-primary": string;
  shadow: string;
}

interface MaterialColorsTheme {
  light: MaterialColors;
  dark: MaterialColors;
}

type ThemeColorName = `${keyof MaterialColors}-${keyof MaterialColorsTheme}`;
type ThemeColors = Record<ThemeColorName, string>;

function extractColorFromCssVar(cssVar: string) {
  const rootStyles = getComputedStyle(document.documentElement);
  const varName = cssVar.replace(/var\(([a-z0-9-]+)\)/, "$1");
  return rootStyles.getPropertyValue(varName).trim();
}

async function prepareThemeColors(from: string) {
  if (from.startsWith("var(")) {
    from = extractColorFromCssVar(from);
  }

  const theme = await materialDynamicColors(from);

  //@ts-expect-error The properties are added in the next for loop
  const themeColors: ThemeColors = {};

  let mode: keyof IMaterialDynamicColorsTheme;
  for (mode in theme) {
    let color: keyof IMaterialDynamicColorsThemeColor;
    for (color in theme[mode]) {
      const colorFormatted = convertCase(color, "camel", "kebab") as keyof MaterialColors;
      const cssColor: ThemeColorName = `${colorFormatted}-${mode}`;
      themeColors[cssColor] = theme[mode][color];
    }
  }

  return themeColors;
}

class QTheme {
  themeColors = $state({} as ThemeColors);

  constructor() {
    prepareThemeColors("#3499E7").then((res) => (this.themeColors = res));
  }

  private apply() {
    const root = document.documentElement;
    if (root === null) return;

    let colorName: ThemeColorName;
    for (colorName in this.themeColors) {
      root.style.setProperty(
        `--${colorName}`,
        QColors.hexToRgb(this.themeColors[colorName]).join(", ")
      );
    }
  }

  updateThemeColor(color: ThemeColorName, newVal: string) {
    this.themeColors[color] = newVal;
  }

  async setTheme(from: string) {
    const newTheme = await prepareThemeColors(from);
    this.themeColors = newTheme;
    this.apply();
  }
}

export default new QTheme();
