import { writable } from "svelte/store";
import materialDynamicColors from "material-dynamic-colors";
import { convertCase } from "$lib/utils/string";
import QColors from "$lib/utils/colors";

type CSSDynamicColor =
  `${keyof IMaterialDynamicColorsThemeColor}-${keyof IMaterialDynamicColorsTheme}`;

async function prepareThemeColors(from: string) {
  let theme: IMaterialDynamicColorsTheme = await materialDynamicColors(from);
  //@ts-ignore
  const themeColors: Record<CSSDynamicColor, string> = {};

  let mode: keyof IMaterialDynamicColorsTheme;
  for (mode in theme) {
    let color: keyof IMaterialDynamicColorsThemeColor;
    for (color in theme[mode]) {
      let cssColor: CSSDynamicColor = `${color}-${mode}`;
      themeColors[cssColor] = theme[mode][color];
    }
  }

  return themeColors;
}

/* const defaultThemeColors = await prepareThemeColors("/cocktail.jpg"); */
const defaultThemeColors = await prepareThemeColors("#0655CA");

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
          `--${convertCase(colorName, "camel", "kebab")}`,
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
