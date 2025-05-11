import {
  TonalPalette,
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
  type Theme,
} from "@material/material-color-utilities";
import { isNumeric } from "./number.js";
import { convertCase } from "./string.js";

export type Mode = "light" | "dark";
export type HexValue = `#${string}`;

type BaseColorNames = [
  "error",
  "error-container",
  "on-error",
  "on-error-container",
  "on-primary",
  "on-primary-container",
  "on-secondary",
  "on-secondary-container",
  "on-tertiary",
  "on-tertiary-container",
  "primary",
  "primary-container",
  "secondary",
  "secondary-container",
  "tertiary",
  "tertiary-container",
];

type BaseColors = Record<BaseColorNames[number], HexValue>;

type ToneColorNames = [
  "background",
  "inverse-on-surface",
  "inverse-primary",
  "inverse-surface",
  "on-background",
  "on-primary-fixed",
  "on-primary-fixed-variant",
  "on-secondary-fixed",
  "on-secondary-fixed-variant",
  "on-surface",
  "on-surface-variant",
  "on-tertiary-fixed",
  "on-tertiary-fixed-variant",
  "outline",
  "outline-variant",
  "primary-fixed",
  "primary-fixed-dim",
  "scrim",
  "secondary-fixed",
  "secondary-fixed-dim",
  "shadow",
  "surface",
  "surface-bright",
  "surface-container",
  "surface-container-high",
  "surface-container-highest",
  "surface-container-low",
  "surface-container-lowest",
  "surface-dim",
  "surface-tint",
  "surface-variant",
  "tertiary-fixed",
  "tertiary-fixed-dim",
];

type ToneColors = Record<ToneColorNames[number], HexValue>;

export type QuaffColorNames = [...BaseColorNames, ...ToneColorNames];
export type QuaffColors = BaseColors & ToneColors;

const COLOR_TONES: Record<
  keyof ToneColors,
  { fromColor: keyof Theme["palettes"]; light: number; dark: number }
> = {
  background: { fromColor: "neutral", light: 98, dark: 6 },
  "inverse-on-surface": { fromColor: "neutral", light: 95, dark: 20 },
  "inverse-primary": { fromColor: "primary", light: 80, dark: 40 },
  "inverse-surface": { fromColor: "neutral", light: 20, dark: 90 },
  "on-background": { fromColor: "neutral", light: 10, dark: 90 },
  "on-primary-fixed": { fromColor: "primary", light: 10, dark: 10 },
  "on-primary-fixed-variant": { fromColor: "primary", light: 30, dark: 30 },
  "on-secondary-fixed": { fromColor: "secondary", light: 10, dark: 10 },
  "on-secondary-fixed-variant": { fromColor: "secondary", light: 30, dark: 30 },
  "on-surface": { fromColor: "neutral", light: 10, dark: 90 },
  "on-surface-variant": { fromColor: "neutralVariant", light: 30, dark: 80 },
  "on-tertiary-fixed": { fromColor: "tertiary", light: 10, dark: 10 },
  "on-tertiary-fixed-variant": { fromColor: "tertiary", light: 30, dark: 30 },
  outline: { fromColor: "neutralVariant", light: 50, dark: 60 },
  "outline-variant": { fromColor: "neutralVariant", light: 80, dark: 30 },
  "primary-fixed": { fromColor: "primary", light: 90, dark: 90 },
  "primary-fixed-dim": { fromColor: "primary", light: 80, dark: 80 },
  scrim: { fromColor: "neutral", light: 0, dark: 0 },
  "secondary-fixed": { fromColor: "secondary", light: 90, dark: 90 },
  "secondary-fixed-dim": { fromColor: "secondary", light: 80, dark: 80 },
  shadow: { fromColor: "neutral", light: 0, dark: 0 },
  surface: { fromColor: "neutral", light: 98, dark: 6 },
  "surface-bright": { fromColor: "neutral", light: 98, dark: 24 },
  "surface-container": { fromColor: "neutral", light: 94, dark: 12 },
  "surface-container-high": { fromColor: "neutral", light: 92, dark: 17 },
  "surface-container-highest": { fromColor: "neutral", light: 90, dark: 22 },
  "surface-container-low": { fromColor: "neutral", light: 96, dark: 10 },
  "surface-container-lowest": { fromColor: "neutral", light: 100, dark: 4 },
  "surface-dim": { fromColor: "neutral", light: 87, dark: 6 },
  "surface-tint": { fromColor: "primary", light: 40, dark: 80 },
  "surface-variant": { fromColor: "neutralVariant", light: 90, dark: 30 },
  "tertiary-fixed": { fromColor: "tertiary", light: 90, dark: 90 },
  "tertiary-fixed-dim": { fromColor: "tertiary", light: 80, dark: 80 },
};

export function generateColors(from: string): { light: QuaffColors; dark: QuaffColors } {
  const argb = argbFromHex(from);
  const palettes = themeFromSourceColor(argb).palettes;

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
          onBaseContainer: 30,
        }
      : {
          base: 80,
          onBase: 20,
          baseContainer: 30,
          onBaseContainer: 90,
        };

  const getColor = (color: string, palette: TonalPalette) => {
    color = convertCase(color, "pascal", "kebab");

    return [
      [color, palette.tone(tones.base)],
      [`on-${color}`, palette.tone(tones.onBase)],
      [`${color}-container`, palette.tone(tones.baseContainer)],
      [`on-${color}-container`, palette.tone(tones.onBaseContainer)],
    ];
  };

  const results: Record<keyof QuaffColors, number> = Object.fromEntries(
    Object.entries(palettes)
      .filter(([color]) => !["neutral", "neutralVariant"].includes(color))
      .map(([color, palette]) => getColor(color, palette))
      .flat(1)
  );

  let toneColor: keyof typeof COLOR_TONES;
  for (toneColor in COLOR_TONES) {
    const toneInfo = COLOR_TONES[toneColor];
    results[toneColor] = palettes[toneInfo.fromColor].tone(toneInfo[mode]);
  }

  return Object.fromEntries(
    Object.entries(results).map(([color, value]) => [color, hexFromArgb(value)])
  ) as QuaffColors;
}

class QColors {
  private static hexRegex: RegExp = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  private static isValidRgb(r: string | number, g: string | number, b: string | number): boolean {
    return (
      isNumeric(r) &&
      isNumeric(g) &&
      isNumeric(b) &&
      +r >= 0 &&
      +r <= 255 &&
      +g >= 0 &&
      +g <= 255 &&
      +b >= 0 &&
      +b <= 255
    );
  }

  private static isValidHsl(h: string | number, s: string | number, l: string | number): boolean {
    return (
      isNumeric(h) &&
      isNumeric(s) &&
      isNumeric(l) &&
      +h >= 0 &&
      +h <= 360 &&
      +s >= 0 &&
      +s <= 100 &&
      +l >= 0 &&
      +l <= 100
    );
  }

  static rgbToHex(r: string | number, g: string | number, b: string | number): string {
    if (!QColors.isValidRgb(r, g, b)) {
      throw new Error("Invalid RGB values. They should be in the range 0-255.");
    }
    return "#" + ((1 << 24) + (+r << 16) + (+g << 8) + +b).toString(16).slice(1);
  }

  static hexToRgb(hex: string): number[] {
    if (!QColors.hexRegex.test(hex)) {
      throw new Error(
        "Invalid HEX value. It should follow the format #xxxxxx or #xxx where x is a hexadecimal digit."
      );
    }
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [];
  }

  static rgbToHsl(r: string | number, g: string | number, b: string | number): number[] {
    if (!QColors.isValidRgb(r, g, b)) {
      throw new Error("Invalid RGB values. They should be in the range 0-255.");
    }
    r = +r / 255;
    g = +g / 255;
    b = +b / 255;

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h: number, s: number;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const delta = max - min;
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      switch (max) {
        case r:
        default:
          h = (g - b) / delta + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / delta + 2;
          break;
        case b:
          h = (r - g) / delta + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  static hslToRgb(h: string | number, s: string | number, l: string | number): number[] {
    if (!QColors.isValidHsl(h, s, l)) {
      throw new Error(
        "Invalid HSL values. Hue should be in the range 0-360, saturation and lightness in the range 0-100."
      );
    }
    let r: number, g: number, b: number;
    h = +h / 360;
    s = +s / 100;
    l = +l / 100;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) {
          t += 1;
        }
        if (t > 1) {
          t -= 1;
        }
        if (t < 1 / 6) {
          return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
          return q;
        }
        if (t < 2 / 3) {
          return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  static hexToHsl(hex: HexValue): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s;

    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h *= 60;
    }

    return { h, s: s * 100, l: l * 100 };
  }

  static calculateHueRotate(fromHex: HexValue, toHex: HexValue): number {
    const from = QColors.hexToHsl(fromHex);
    const to = QColors.hexToHsl(toHex);
    let rotate = to.h - from.h;
    if (rotate < 0) {
      rotate += 360;
    }

    return Math.round(rotate);
  }
}

export default QColors;
