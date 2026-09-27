export interface Color {
  hue: number;
  saturation: number;
  brightness: number;
  alpha: number;
}

const HEX_PATTERN = /^#?([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
const NUMBER_PATTERN = String.raw`[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?`;
const LEGACY_RGB_PATTERN = new RegExp(
  String.raw`^rgba?\(\s*(${NUMBER_PATTERN})\s*,\s*(${NUMBER_PATTERN})\s*,\s*(${NUMBER_PATTERN})(?:\s*,\s*(${NUMBER_PATTERN}%?))?\s*\)$`,
  "i"
);
const MODERN_RGB_PATTERN = new RegExp(
  String.raw`^rgba?\(\s*(${NUMBER_PATTERN})\s+(${NUMBER_PATTERN})\s+(${NUMBER_PATTERN})(?:\s*\/\s*(${NUMBER_PATTERN}%?))?\s*\)$`,
  "i"
);

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function parseColor(value: string | null | undefined, previous?: Color): Color | undefined {
  if (typeof value !== "string") {
    return;
  }

  const input = value.trim();
  const hexMatch = HEX_PATTERN.exec(input);
  let red: number;
  let green: number;
  let blue: number;
  let alpha = 1;

  if (hexMatch) {
    const hex =
      hexMatch[1].length <= 4
        ? [...hexMatch[1]].map((digit) => digit + digit).join("")
        : hexMatch[1];
    red = parseInt(hex.slice(0, 2), 16);
    green = parseInt(hex.slice(2, 4), 16);
    blue = parseInt(hex.slice(4, 6), 16);

    if (hex.length === 8) {
      alpha = parseInt(hex.slice(6), 16) / 255;
    }
  } else {
    const rgbMatch = LEGACY_RGB_PATTERN.exec(input) ?? MODERN_RGB_PATTERN.exec(input);

    if (!rgbMatch) {
      return;
    }

    [red, green, blue] = rgbMatch.slice(1, 4).map(Number);

    if (rgbMatch[4] !== undefined) {
      const alphaValue = rgbMatch[4];
      alpha = alphaValue.endsWith("%") ? Number(alphaValue.slice(0, -1)) / 100 : Number(alphaValue);
    }

    if (
      [red, green, blue].some(
        (channel) => !Number.isFinite(channel) || channel < 0 || channel > 255
      ) ||
      !Number.isFinite(alpha) ||
      alpha < 0 ||
      alpha > 1
    ) {
      return;
    }
  }

  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const delta = maximum - minimum;
  let hue = previous?.hue ?? 0;

  if (delta > 0) {
    if (maximum === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (maximum === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }

    hue = (hue * 60 + 360) % 360;
  }

  return {
    hue,
    saturation: maximum === 0 ? (previous?.saturation ?? 0) : (delta / maximum) * 100,
    brightness: (maximum / 255) * 100,
    alpha,
  };
}

export function colorToRgb(color: Color): { red: number; green: number; blue: number } {
  const hue = (clamp(color.hue, 0, 360) % 360) / 60;
  const saturation = clamp(color.saturation, 0, 100) / 100;
  const brightness = clamp(color.brightness, 0, 100) / 100;
  const chroma = brightness * saturation;
  const secondary = chroma * (1 - Math.abs((hue % 2) - 1));
  const minimum = brightness - chroma;
  const [red, green, blue] = [
    [chroma, secondary, 0],
    [secondary, chroma, 0],
    [0, chroma, secondary],
    [0, secondary, chroma],
    [secondary, 0, chroma],
    [chroma, 0, secondary],
  ][Math.floor(hue)];

  return {
    red: Math.round((red + minimum) * 255),
    green: Math.round((green + minimum) * 255),
    blue: Math.round((blue + minimum) * 255),
  };
}

export function formatColor(color: Color, format: "hex" | "rgb" = "hex", alpha = false): string {
  const { red, green, blue } = colorToRgb(color);
  const opacity = clamp(color.alpha, 0, 1);

  if (format === "rgb") {
    return alpha
      ? `rgba(${red}, ${green}, ${blue}, ${Number(opacity.toFixed(3))})`
      : `rgb(${red}, ${green}, ${blue})`;
  }

  const channels = alpha ? [red, green, blue, Math.round(opacity * 255)] : [red, green, blue];
  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}
