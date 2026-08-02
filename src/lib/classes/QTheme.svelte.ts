import { Variant } from "@material/material-color-utilities";
import { untrack } from "svelte";
import { convertCase, generateColors, type HexValue, type Mode, type QuaffColors } from "$utils";

type ThemeColor = keyof QuaffColors;
type ThemeColorKey = `${ThemeColor}${Capitalize<Mode>}`;
type ThemeColors = Record<ThemeColorKey, HexValue>;

export type ThemeVariant =
  | "monochrome"
  | "neutral"
  | "tonalSpot"
  | "vibrant"
  | "expressive"
  | "fidelity"
  | "content"
  | "rainbow"
  | "fruitSalad";

function extractColorFromCssVar(cssVar: string) {
  const rootStyles = getComputedStyle(document.documentElement);
  // remove var(...) to get only the color
  const varName = cssVar.replace(/var\(([a-z0-9-]+)\)/, "$1");
  return rootStyles.getPropertyValue(varName).trim();
}

function getThemeVariant(variant: ThemeVariant) {
  switch (variant) {
    case "monochrome":
      return Variant.MONOCHROME;
    case "neutral":
      return Variant.NEUTRAL;
    case "tonalSpot":
      return Variant.TONAL_SPOT;
    case "vibrant":
      return Variant.VIBRANT;
    case "expressive":
      return Variant.EXPRESSIVE;
    case "fidelity":
      return Variant.FIDELITY;
    case "content":
      return Variant.CONTENT;
    case "rainbow":
      return Variant.RAINBOW;
    case "fruitSalad":
      return Variant.FRUIT_SALAD;
    default:
      return Variant.VIBRANT;
  }
}

function prepareThemeColors(from: string, variant: ThemeVariant = "vibrant", contrastLevel = 0) {
  if (from.startsWith("var(")) {
    from = extractColorFromCssVar(from);
  }

  const theme = generateColors({
    sourceColor: from as HexValue,
    variant: getThemeVariant(variant),
    contrastLevel,
  });

  //@ts-expect-error The properties are added in the next for loop
  const themeColors: ThemeColors = {};

  let mode: Mode;
  for (mode in theme) {
    const capitalizedMode = (mode.charAt(0).toUpperCase() + mode.slice(1)) as Capitalize<Mode>;
    let color: ThemeColor;
    for (color in theme[mode]) {
      themeColors[`${color}${capitalizedMode}`] = theme[mode][color];
    }
  }

  return themeColors;
}

class QTheme {
  themeColors = $state({} as ThemeColors);
  srcColor = $state("#0039b4");
  variant = $state<ThemeVariant>("vibrant");
  contrastLevel = $state<number>(0);

  private normalizeContrastLevel = $derived.by(() => {
    if (this.contrastLevel < -1 || this.contrastLevel > 1) {
      console.warn(
        "The theme's contrast level should be between -1 and 1, where -1 represents minimum contrast, 0 represents standard (i.e. the design as spec'd), and 1 represents maximum contrast."
      );

      return Math.max(-1, Math.min(this.contrastLevel, 1));
    }

    return this.contrastLevel;
  });

  constructor() {
    this.themeColors = prepareThemeColors(this.srcColor, this.variant, this.normalizeContrastLevel);
  }

  private apply(colors: Partial<ThemeColors> = this.themeColors) {
    const root = document.documentElement;
    const colorNames = new Set(
      (Object.keys(colors) as ThemeColorKey[]).map(
        (color) => color.replace(/Light|Dark/, "") as ThemeColor
      )
    );

    for (const color of colorNames) {
      const kebab = convertCase(color, "camel", "kebab");

      root.style.setProperty(
        `--${kebab}`,
        `light-dark(${this.themeColors[`${color}Light`]}, ${this.themeColors[`${color}Dark`]})`
      );
    }
  }

  setContrastLevel(contrastLevel: number) {
    untrack(() => {
      this.contrastLevel = contrastLevel;
      this.themeColors = prepareThemeColors(
        this.srcColor,
        this.variant,
        this.normalizeContrastLevel
      );
      this.apply();
    });
  }

  setThemeVariant(variant: ThemeVariant) {
    untrack(() => {
      this.variant = variant;
      this.themeColors = prepareThemeColors(this.srcColor, variant, this.normalizeContrastLevel);
      this.apply();
    });
  }

  updateThemeColor(color: keyof ThemeColors, newVal: HexValue) {
    untrack(() => {
      this.themeColors[color] = newVal;
      this.apply({ [color]: newVal });
    });
  }

  updateThemeColors(colors: Partial<ThemeColors>) {
    untrack(() => {
      let colorName: keyof ThemeColors;
      for (colorName in colors) {
        const color = colors[colorName];

        if (color) {
          this.themeColors[colorName] = color;
        }
      }

      this.apply(colors);
    });
  }

  setTheme(from: string) {
    untrack(() => {
      this.srcColor = from;
      this.themeColors = prepareThemeColors(from, this.variant, this.normalizeContrastLevel);
      this.apply();
    });
  }
}

export default new QTheme();
