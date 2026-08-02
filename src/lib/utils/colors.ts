import {
  DynamicScheme,
  Hct,
  MaterialDynamicColors,
  Variant,
  argbFromHex,
  hexFromArgb,
} from "@quaffui/material-color-utilities";
import { isNumeric } from "./number";
import { convertCase } from "./string";

export type Mode = "light" | "dark";
export type HexValue = `#${string}`;

export interface QColorsOptions {
  sourceColor: HexValue;
  variant?: Variant;
  contrastLevel?: number;
}

type NamesToExclude =
  | "highestSurface"
  | "allColors"
  | "primaryPaletteKeyColor"
  | "secondaryPaletteKeyColor"
  | "tertiaryPaletteKeyColor"
  | "neutralPaletteKeyColor"
  | "neutralVariantPaletteKeyColor"
  | "errorPaletteKeyColor";

export type QuaffColorName = Exclude<keyof MaterialDynamicColors, NamesToExclude>;
export type QuaffColors = Record<QuaffColorName, HexValue>;

export function generateColors({
  sourceColor,
  variant = Variant.VIBRANT,
  contrastLevel = 0,
}: QColorsOptions): { light: QuaffColors; dark: QuaffColors } {
  const argb = argbFromHex(sourceColor);
  const hct = Hct.fromInt(argb);

  const baseOptions = { sourceColorHct: hct, variant, contrastLevel };

  return {
    light: getColors({ ...baseOptions, isDark: false }),
    dark: getColors({ ...baseOptions, isDark: true }),
  };
}

function getColors(opts: ConstructorParameters<typeof DynamicScheme>[0]) {
  const scheme = new DynamicScheme(opts);

  const results = {} as QuaffColors;

  for (const color of scheme.colors.allColors) {
    const colorName = convertCase(color.name, "snake", "camel") as QuaffColorName;
    const hex = hexFromArgb(color.getArgb(scheme)) as HexValue;

    results[colorName] = hex;
  }

  // Colors that aren't in allcolors
  const remainingColors = ["scrim", "shadow", "surfaceTint", "surfaceVariant"] as const;
  for (const color of remainingColors) {
    const colorName = convertCase(color, "snake", "camel") as QuaffColorName;
    const hex = hexFromArgb(scheme.colors[color]().getArgb(scheme)) as HexValue;

    results[colorName] = hex;
  }

  return results;
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

    const normalized =
      hex.length === 4
        ? hex.replace(/./g, (character, index) => (index ? character + character : character))
        : hex;
    const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)!;
    return result.slice(1).map((value) => parseInt(value, 16));
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
    const [r, g, b] = QColors.hexToRgb(hex).map((value) => value / 255);

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
