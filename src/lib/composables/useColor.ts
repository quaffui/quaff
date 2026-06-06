export function useColor(color: string) {
  const cssColorPrefixes = [
    "#",
    "rgb",
    "hsl",
    "hwb",
    "inherit",
    "initial",
    "revert",
    "revert-layer",
    "unset",
  ];

  for (const prefix of cssColorPrefixes) {
    if (color.startsWith(prefix)) {
      return color;
    }
  }

  return `var(--${color}, ${color})`;
}
