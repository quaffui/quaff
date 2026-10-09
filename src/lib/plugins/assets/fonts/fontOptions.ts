import type { FontDisplay } from "../assetOptions.js";

const FONT_DISPLAYS = ["auto", "block", "swap", "fallback", "optional"] as const;

export function selectFontValues<Value extends string | number>(
  configured: readonly Value[] | undefined,
  defaults: readonly Value[],
  available: readonly Value[],
  label: string
) {
  const values = [...new Set(configured ?? defaults)];

  if (!values.length || values.some((value) => !available.includes(value))) {
    throw new Error(`[quaff:fonts] Invalid ${label}. Choose from: ${available.join(", ")}.`);
  }

  return values;
}

export function getFontDisplay(value: FontDisplay | undefined, fallback: FontDisplay) {
  return selectFontValues(
    value === undefined ? undefined : [value],
    [fallback],
    FONT_DISPLAYS,
    "font display"
  )[0];
}
