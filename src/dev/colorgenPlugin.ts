import fs from "fs/promises";
import { format } from "prettier";
import { convertCase } from "../lib/utils/string";
import { generateColors } from "../lib/utils/colors";
import type { HexValue, QuaffColors } from "../lib/utils/colors";

const BASE_COLOR = "#0039b4";

export async function writeColorFile() {
  const colors = generateColors({ sourceColor: BASE_COLOR });

  const rootContent = ["color-scheme: light dark;", ""];
  const themeColors: Record<string, HexValue> = {};

  let colorName: keyof QuaffColors;

  for (colorName in colors.light) {
    const lightEntry = colors.light[colorName];
    const darkEntry = colors.dark[colorName];

    const kebab = convertCase(colorName, "camel", "kebab");

    rootContent.push(`--${kebab}: light-dark(${lightEntry}, ${darkEntry});`);
    themeColors[`${colorName}Light`] = lightEntry;
    themeColors[`${colorName}Dark`] = darkEntry;
  }

  const disclaimer = "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE";
  const root = `:root {${rootContent.join("\n")}}`;

  const content = [disclaimer, root].join("\n\n");

  const pathToCssFile = new URL("../lib/css/theme/_colors.scss", import.meta.url);

  const formatted = await format(content, { parser: "css" });

  await fs.writeFile(pathToCssFile, formatted);

  const themeSource = `${disclaimer}

export const DEFAULT_THEME_SOURCE_COLOR = ${JSON.stringify(BASE_COLOR)};
export const DEFAULT_THEME_COLORS = ${JSON.stringify(themeColors)} as const;
`;
  const pathToThemeFile = new URL("../lib/internal/defaultTheme.ts", import.meta.url);
  const formattedTheme = await format(themeSource, { parser: "typescript" });

  await fs.writeFile(pathToThemeFile, formattedTheme);
}
