import { describe, expect, it } from "vitest";
import { clamp, colorToRgb, formatColor, parseColor, type Color } from "./color";

const PREVIOUS: Color = { hue: 285, saturation: 75, brightness: 50, alpha: 0.25 };

describe("color parsing", () => {
  it.each([
    ["#f80", "#FF8800FF"],
    ["f80", "#FF8800FF"],
    ["#f808", "#FF880088"],
    ["f808", "#FF880088"],
    ["#fF8800", "#FF8800FF"],
    ["ff8800", "#FF8800FF"],
    ["#fF880080", "#FF880080"],
    ["ff880080", "#FF880080"],
    [" rgb(255, 136, 0) ", "#FF8800FF"],
    ["rgba(255, 136, 0, .5)", "#FF880080"],
    ["RGB(255 136 0)", "#FF8800FF"],
    ["rgb(255 136 0 / 50%)", "#FF880080"],
    ["rgba(255 136 0/.5)", "#FF880080"],
    ["rgba(255, 136, 0, 50%)", "#FF880080"],
    ["rgb(+255 1.36e2 0 / 5e1%)", "#FF880080"],
  ])("parses %s", (input, expected) => {
    expect(formatColor(parseColor(input)!, "hex", true)).toBe(expected);
  });

  it.each([
    null,
    undefined,
    "",
    " ",
    "#ff",
    "#fffff",
    "#fffffff",
    "#fffffffff",
    "#ggg",
    "##fff",
    "red",
    "transparent",
    "hsl(20, 50%, 50%)",
    "var(--color)",
    "rgb(0, 0)",
    "rgb(0, 0, 0,)",
    "rgb(0 0 0 0)",
    "rgb(0, 0 0)",
    "rgb(0, 0, 0 / .5)",
    "rgb(0 0 0, .5)",
    "rgb(0 0 0 /)",
    "rgb(0 0 0 / .5 / .5)",
    "rgb(100% 0% 0%)",
    "rgb(256, 0, 0)",
    "rgb(0, -1, 0)",
    "rgb(0, 0, 255.1)",
    "rgb(NaN 0 0)",
    "rgb(Infinity 0 0)",
    "rgb(1e999 0 0)",
    "rgba(0, 0, 0, -0.1)",
    "rgba(0, 0, 0, 1.1)",
    "rgb(0 0 0 / 101%)",
    "rgb(0 0 0 / 1e999)",
    "rgb(0 0 0) trailing",
  ])("rejects invalid or unsupported input %s", (input) => {
    expect(parseColor(input)).toBeUndefined();
  });

  it("preserves hue for gray and hue plus saturation for black", () => {
    expect(parseColor("#808080", PREVIOUS)).toEqual({
      hue: 285,
      saturation: 0,
      brightness: (128 / 255) * 100,
      alpha: 1,
    });
    expect(parseColor("#0000", PREVIOUS)).toEqual({
      hue: 285,
      saturation: 75,
      brightness: 0,
      alpha: 0,
    });
    expect(parseColor("#fff")).toEqual({ hue: 0, saturation: 0, brightness: 100, alpha: 1 });
    expect(parseColor("#000")).toEqual({ hue: 0, saturation: 0, brightness: 0, alpha: 1 });
    expect(PREVIOUS).toEqual({ hue: 285, saturation: 75, brightness: 50, alpha: 0.25 });
  });

  it("computes HSV and opacity without quantizing decimal RGB input", () => {
    const color = parseColor("rgb(127.5 63.75 0 / 12.5%)")!;
    expect(color.hue).toBeCloseTo(30);
    expect(color.saturation).toBeCloseTo(100);
    expect(color.brightness).toBeCloseTo(50);
    expect(color.alpha).toBe(0.125);
  });
});

describe("color conversion and formatting", () => {
  it.each([
    [0, "#FF0000"],
    [60, "#FFFF00"],
    [120, "#00FF00"],
    [180, "#00FFFF"],
    [240, "#0000FF"],
    [300, "#FF00FF"],
    [360, "#FF0000"],
  ])("converts hue %s at full saturation and brightness", (hue, expected) => {
    const color = { hue, saturation: 100, brightness: 100, alpha: 1 };
    expect(formatColor(color)).toBe(expected);
    expect(parseColor(expected)!.hue).toBe(hue % 360);
  });

  it("converts an intermediate hue with partial saturation and brightness", () => {
    const color = { hue: 30, saturation: 50, brightness: 80, alpha: 0.5 };
    expect(colorToRgb(color)).toEqual({ red: 204, green: 153, blue: 102 });
    expect(formatColor(color)).toBe("#CC9966");
    expect(formatColor(color, "hex", true)).toBe("#CC996680");
    expect(formatColor(color, "rgb")).toBe("rgb(204, 153, 102)");
    expect(formatColor(color, "rgb", true)).toBe("rgba(204, 153, 102, 0.5)");
  });

  it.each(["#123456", "#ABCDEF", "#FE0182", "#000000", "#FFFFFF", "#808080"])(
    "round trips %s through RGB and HSV",
    (hex) => {
      const color = parseColor(hex)!;
      expect(formatColor(color)).toBe(hex);
      expect(formatColor(parseColor(formatColor(color, "rgb"))!)).toBe(hex);
    }
  );

  it("round trips every alpha byte through both formats", () => {
    for (let alpha = 0; alpha <= 255; alpha++) {
      const hex = `#123456${alpha.toString(16).padStart(2, "0").toUpperCase()}`;
      const color = parseColor(hex)!;
      expect(formatColor(color, "hex", true)).toBe(hex);
      const rgb = formatColor(color, "rgb", true);
      expect(formatColor(parseColor(rgb)!, "hex", true)).toBe(hex);
    }
  });

  it("serializes alpha endpoints and can drop opacity explicitly", () => {
    expect(formatColor(parseColor("#0000")!, "rgb", true)).toBe("rgba(0, 0, 0, 0)");
    expect(formatColor(parseColor("#ffff")!, "rgb", true)).toBe("rgba(255, 255, 255, 1)");
    expect(formatColor(parseColor("#0000")!)).toBe("#000000");
  });

  it("clamps values at the control boundaries", () => {
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(35, 0, 100)).toBe(35);
    expect(clamp(110, 0, 100)).toBe(100);
    expect(formatColor({ hue: 360, saturation: 110, brightness: 110, alpha: 2 }, "hex", true)).toBe(
      "#FF0000FF"
    );
  });
});
