import { isNumber } from "./types";

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
    let h: number,
      s: number,
      l = (max + min) / 2;

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
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
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
