import { writable } from "svelte/store";
import materialDynamicColors from "material-dynamic-colors";
import { convertCase } from "$lib/utils/string";
import QColors from "$lib/utils/colors";

interface IMaterialDynamicColorsThemeColorFormatted {
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

interface IMaterialDynamicColorsThemeFormatted {
  light: IMaterialDynamicColorsThemeColorFormatted;
  dark: IMaterialDynamicColorsThemeColorFormatted;
}

type CSSDynamicColor =
  `${keyof IMaterialDynamicColorsThemeColorFormatted}-${keyof IMaterialDynamicColorsThemeFormatted}`;

async function prepareThemeColors(from: string) {
  let theme: IMaterialDynamicColorsTheme = await materialDynamicColors(from);

  //@ts-ignore
  const themeColors: Record<CSSDynamicColor, string> = {};

  let mode: keyof IMaterialDynamicColorsTheme;
  for (mode in theme) {
    let color: keyof IMaterialDynamicColorsThemeColor;
    for (color in theme[mode]) {
      let colorFormatted = convertCase(
        color,
        "camel",
        "kebab"
      ) as keyof IMaterialDynamicColorsThemeColorFormatted;

      let cssColor: CSSDynamicColor = `${colorFormatted}-${mode}`;
      themeColors[cssColor] = theme[mode][color];
    }
  }

  return themeColors;
}

/* const defaultThemeColors = await prepareThemeColors("/cocktail.jpg"); */
const defaultThemeColors = await prepareThemeColors("#3499E7");

function themeBuilder() {
  const { subscribe, set, update } = writable(defaultThemeColors);

  const setThemeColors = async (from: string) => {
    let newTheme = await prepareThemeColors(from);
    set(newTheme);
  };

  const updateThemeColor = (color: CSSDynamicColor, newValue: string) => {
    update(($themeColors) => {
      $themeColors[color] = newValue;

      return $themeColors;
    });
  };

  const apply = () => {
    let root = document.documentElement;
    if (root === null) return;

    update(($themeColors) => {
      let colorName: CSSDynamicColor;
      for (colorName in $themeColors) {
        root.style.setProperty(
          `--${colorName}`,
          QColors.hexToRgb($themeColors[colorName]).join(", ")
        );
      }

      return $themeColors;
    });
  };
  return {
    subscribe,
    setThemeColors,
    updateThemeColor,
    apply,
  };
}

export const QTheme = themeBuilder();
