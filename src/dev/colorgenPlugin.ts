import { argbFromHex, hexFromArgb, themeFromSourceColor } from "@material/material-color-utilities";
import type { Theme, TonalPalette } from "@material/material-color-utilities";
import fs from "node:fs";

const BASE_COLOR = argbFromHex("#0039b4");

export function generateColors() {
  const palettes = themeFromSourceColor(BASE_COLOR).palettes;

  return {
    light: getColors(palettes, "light"),
    dark: getColors(palettes, "dark"),
  };
}

function getColors(palettes: Theme["palettes"], mode: "light" | "dark") {
  const tones =
    mode === "light"
      ? {
          base: 40,
          onBase: 100,
          baseContainer: 90,
          onBaseContainer: 10,
        }
      : {
          base: 80,
          onBase: 20,
          baseContainer: 30,
          onBaseContainer: 90,
        };

  const getColor = (color: string, palette: TonalPalette) => {
    color = color.replaceAll(/([A-Z])/g, "-$1").toLowerCase();

    return [
      [color, palette.tone(tones.base)],
      [`on-${color}`, palette.tone(tones.onBase)],
      [`${color}-container`, palette.tone(tones.baseContainer)],
      [`on-${color}-container`, palette.tone(tones.onBaseContainer)],
    ];
  };

  const results: Record<string, number> = Object.fromEntries(
    Object.entries(palettes)
      .map(([color, palette]) => getColor(color, palette))
      .flat(1)
  );

  results["surface"] = palettes.neutral.tone(mode === "light" ? 98 : 6);
  results["surface-dim"] = palettes.neutral.tone(mode === "light" ? 87 : 6);
  results["surface-bright"] = palettes.neutral.tone(mode === "light" ? 98 : 24);

  results["on-surface"] = palettes.neutral.tone(mode === "light" ? 10 : 90);
  results["on-surface-variant"] = palettes.neutralVariant.tone(mode === "light" ? 30 : 90);

  results["surface-container-lowest"] = palettes.neutral.tone(mode === "light" ? 100 : 4);
  results["surface-container-low"] = palettes.neutral.tone(mode === "light" ? 96 : 10);
  results["surface-container"] = palettes.neutral.tone(mode === "light" ? 94 : 12);
  results["surface-container-high"] = palettes.neutral.tone(mode === "light" ? 92 : 17);
  results["surface-container-highest"] = palettes.neutral.tone(mode === "light" ? 90 : 24);

  results["inverse-surface"] = palettes.neutral.tone(mode === "light" ? 20 : 90);
  results["inverse-on-surface"] = palettes.neutral.tone(mode === "light" ? 95 : 20);
  results["inverse-primary"] = palettes.primary.tone(mode === "light" ? 80 : 40);

  results["outline"] = palettes.neutralVariant.tone(mode === "light" ? 50 : 60);
  results["outline-variant"] = palettes.neutralVariant.tone(mode === "light" ? 80 : 30);

  results["scrim"] = palettes.neutral.tone(0);
  results["shadow"] = palettes.neutral.tone(0);

  return Object.fromEntries(
    Object.entries(results).map(([color, value]) => [color, hexFromArgb(value)])
  );
}

function stringFromPalette(palette: Record<string, string>) {
  return Object.entries(palette)
    .map(([color, hex]) => `  --${color}: ${hex};\n`)
    .join("");
}

function writeColorFile() {
  const colors = generateColors();
  const cssContent = Object.entries(colors)
    .map(([mode, palette]) => `.body--${mode} {\n${stringFromPalette(palette)}}`)
    .join("\n\n");

  const pathToCssFile = new URL("../lib/css/theme/_colors.scss", import.meta.url);

  fs.writeFileSync(pathToCssFile, cssContent);
}

writeColorFile();
