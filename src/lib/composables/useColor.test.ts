import { describe, expect, it } from "vitest";
import { useColor } from "./useColor";

describe("useColor", () => {
  it.each(["primary", "on-surface-variant", "red", "currentColor"])(
    "resolves the color name %s through its theme variable",
    (color) => {
      expect(useColor(color)).toBe(`var(--${color}, ${color})`);
    }
  );

  it.each([
    "#f00",
    "rgb(255 0 0)",
    "hsl(0 100% 50%)",
    "oklch(0.6 0.2 30)",
    "color-mix(in srgb, red, blue)",
    "light-dark(#fff, #000)",
    "var(--brand)",
    "inherit",
    "revert-layer",
  ])("keeps the CSS value %s as written", (color) => {
    expect(useColor(color)).toBe(color);
  });
});
