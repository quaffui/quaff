import { writable } from "svelte/store";
import materialDynamicColors from "material-dynamic-colors";
import { convertCase } from "$lib/utils/string";
import QColors from "$lib/utils/colors";
import type {
  IMaterialDynamicColorsTheme,
  IMaterialDynamicColorsThemeColor,
} from "material-dynamic-colors/src/cdn/interfaces";

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

function extractColorFromCssVar(cssVar: string) {
  const rootStyles = getComputedStyle(document.documentElement);
  const varName = cssVar.replace(/var\(([a-z0-9-]+)\)/, "$1");
  return rootStyles.getPropertyValue(varName).trim();
}

async function prepareThemeColors(from: string) {
  if (from.startsWith("var(")) {
    from = extractColorFromCssVar(from);
  }

  let theme = await materialDynamicColors(from);

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

function themeBuilder() {
  const { subscribe, set, update } = writable({} as Awaited<ReturnType<typeof prepareThemeColors>>);
  prepareThemeColors("#3499E7").then((res) => set(res));

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

  const updateThemeColor = (color: CSSDynamicColor, newValue: string) => {
    update(($themeColors) => {
      $themeColors[color] = newValue;

      return $themeColors;
    });
  };

  const setTheme = async (from: string) => {
    let newTheme = await prepareThemeColors(from);
    set(newTheme);
    apply();
  };

  return {
    subscribe,
    setTheme,
    updateThemeColor,
  };
}

export const QTheme = themeBuilder();
