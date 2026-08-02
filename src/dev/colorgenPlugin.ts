import fs from "fs/promises";
import { format } from "prettier";
import { convertCase } from "../lib/utils/string";
import { generateColors } from "../lib/utils/colors";
import type { QuaffColors } from "../lib/utils/colors";

const BASE_COLOR = "#0039b4";

export async function writeColorFile() {
  const colors = generateColors({ sourceColor: BASE_COLOR });

  const rootContent = ["color-scheme: light dark;", ""];

  let colorName: keyof QuaffColors;
  for (colorName in colors.light) {
    const lightEntry = colors.light[colorName];
    const darkEntry = colors.dark[colorName];

    const kebab = convertCase(colorName, "camel", "kebab");

    rootContent.push(`--${kebab}: light-dark(${lightEntry}, ${darkEntry});`);
  }

  const disclaimer = "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE";
  const root = `:root {${rootContent.join("\n")}}`;

  const content = [disclaimer, root].join("\n\n");

  const pathToCssFile = new URL("../lib/css/theme/_colors.scss", import.meta.url);

  const formatted = await format(content, { parser: "css" });

  await fs.writeFile(pathToCssFile, formatted);
}
