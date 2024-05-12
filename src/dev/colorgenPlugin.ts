import { format } from "prettier";
import fs from "node:fs";
import { generateColors } from "../lib/utils/colors.js";
import type { QuaffColors } from "../lib/utils/colors.js";

const BASE_COLOR = "#0039b4";

function stringFromPalette(palette: QuaffColors, mode: string, type: "root" | "body") {
  const modeString = mode ? `-${mode}` : "";
  return Object.entries(palette)
    .map(([color, hex]) =>
      type === "root" ? `--${color}${modeString}: ${hex};` : `--${color}: var(--${color}-${mode});`
    )
    .join("");
}

export function writeColorFile() {
  const colors = generateColors(BASE_COLOR);
  const disclaimer = "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE";
  const root = `:root {${Object.entries(colors)
    .map(([mode, palette]) => stringFromPalette(palette, mode, "root"))
    .join("")}}`;
  const cssContent = Object.entries(colors)
    .map(([mode, palette]) => `.body--${mode} {${stringFromPalette(palette, mode, "body")}}`)
    .join("");

  const content = [disclaimer, root, cssContent].join("\n\n");

  const pathToCssFile = new URL("../lib/css/theme/_colors.scss", import.meta.url);

  format(content, {
    parser: "css",
  }).then((content) => fs.writeFileSync(pathToCssFile, content));
}
