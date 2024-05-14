import {
  TonalPalette,
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
  type Theme,
} from "@material/material-color-utilities";
import { isNumber } from "./types.js";
import { convertCase } from "./string.js";

export type Mode = "light" | "dark";
export type HexValue = `#${string}`;

type BaseColors = {
  primary: HexValue;
  "on-primary": HexValue;
  "primary-container": HexValue;
  "on-primary-container": HexValue;
  secondary: HexValue;
  "on-secondary": HexValue;
  "secondary-container": HexValue;
  "on-secondary-container": HexValue;
  tertiary: HexValue;
  "on-tertiary": HexValue;
  "tertiary-container": HexValue;
  "on-tertiary-container": HexValue;
  neutral: HexValue;
  "on-neutral": HexValue;
  "neutral-container": HexValue;
  "on-neutral-container": HexValue;
  "neutral-variant": HexValue;
  "on-neutral-variant": HexValue;
  "neutral-variant-container": HexValue;
  "on-neutral-variant-container": HexValue;
  error: HexValue;
  "on-error": HexValue;
  "error-container": HexValue;
  "on-error-container": HexValue;
};

type ToneColors = {
  surface: HexValue;
  "surface-dim": HexValue;
  "surface-bright": HexValue;
  "on-surface": HexValue;
  "on-surface-variant": HexValue;
  "surface-container-lowest": HexValue;
  "surface-container-low": HexValue;
  "surface-container": HexValue;
  "surface-container-high": HexValue;
  "surface-container-highest": HexValue;
  "inverse-surface": HexValue;
  "inverse-on-surface": HexValue;
  "inverse-primary": HexValue;
  outline: HexValue;
  "outline-variant": HexValue;
  scrim: HexValue;
  shadow: HexValue;
};

export type QuaffColors = BaseColors & ToneColors;

const COLOR_TONES: Record<
  keyof ToneColors,
  { fromColor: keyof Theme["palettes"]; light: number; dark: number }
> = {
  surface: { fromColor: "neutral", light: 98, dark: 6 },
  "surface-dim": { fromColor: "neutral", light: 87, dark: 6 },
  "surface-bright": { fromColor: "neutral", light: 98, dark: 24 },
  "on-surface": { fromColor: "neutral", light: 10, dark: 90 },
  "on-surface-variant": { fromColor: "neutralVariant", light: 30, dark: 90 },
  "surface-container-lowest": { fromColor: "neutral", light: 100, dark: 4 },
  "surface-container-low": { fromColor: "neutral", light: 96, dark: 10 },
  "surface-container": { fromColor: "neutral", light: 94, dark: 12 },
  "surface-container-high": { fromColor: "neutral", light: 92, dark: 17 },
  "surface-container-highest": { fromColor: "neutral", light: 90, dark: 24 },
  "inverse-surface": { fromColor: "neutral", light: 20, dark: 90 },
  "inverse-on-surface": { fromColor: "neutral", light: 95, dark: 20 },
  "inverse-primary": { fromColor: "primary", light: 80, dark: 40 },
  outline: { fromColor: "neutralVariant", light: 50, dark: 60 },
  "outline-variant": { fromColor: "neutralVariant", light: 80, dark: 30 },
  scrim: { fromColor: "neutral", light: 0, dark: 0 },
  shadow: { fromColor: "neutral", light: 0, dark: 0 },
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
          onBaseContainer: 10,
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
      isNumber(r) &&
      isNumber(g) &&
      isNumber(b) &&
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
      isNumber(h) &&
      isNumber(s) &&
      isNumber(l) &&
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
    (r = +r / 255), (g = +g / 255), (b = +b / 255);
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
    (h = +h / 360), (s = +s / 100), (l = +l / 100);

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
}

export default QColors;
