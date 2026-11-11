const CSS_WIDE_KEYWORDS = ["inherit", "initial", "revert", "revert-layer", "unset"];

/** Resolves a theme color name to its CSS variable and keeps any other CSS color as written. */
export function useColor(color: string) {
  const isCssValue =
    color.startsWith("#") || color.includes("(") || CSS_WIDE_KEYWORDS.includes(color);

  if (isCssValue) {
    return color;
  }

  return `var(--${color}, ${color})`;
}
