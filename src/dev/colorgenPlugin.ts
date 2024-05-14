import { format } from "prettier";
import fs from "node:fs";
import { generateColors } from "../lib/utils/colors.js";
import type { QuaffColors, Mode } from "../lib/utils/colors.js";
import { Entries } from "$lib/utils/types.js";

const BASE_COLOR = "#0039b4";

function stringFromPalette(palette: QuaffColors, mode: Mode, type: "root" | "body") {
  const modeString = mode ? `-${mode}` : "";
  return Object.entries(palette)
    .map(([color, hex]) =>
      type === "root" ? `--${color}${modeString}: ${hex};` : `--${color}: var(--${color}-${mode});`
    )
    .join("");
}

export function writeColorFile() {
  const colors = generateColors(BASE_COLOR);
  const colorEntries = Object.entries(colors) as Entries<typeof colors>;

  const disclaimer = "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE";
  const root = `:root {${colorEntries
    .map(([mode, palette]) => stringFromPalette(palette, mode, "root"))
    .join("")}}`;
  const cssContent = colorEntries
    .map(([mode, palette]) => `.body--${mode} {${stringFromPalette(palette, mode, "body")}}`)
    .join("");

  const content = [disclaimer, root, cssContent].join("\n\n");

  const pathToCssFile = new URL("../lib/css/theme/_colors.scss", import.meta.url);

  format(content, {
    parser: "css",
  }).then((content) => fs.writeFileSync(pathToCssFile, content));
}
