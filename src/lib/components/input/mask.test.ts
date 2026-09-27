import { describe, expect, it } from "vitest";
import { deleteMaskedToken, maskCaretPosition, maskValue, unmaskValue } from "./mask";

const COLOR_MASK = String.raw`\#XXXXXX`;

describe("escaped mask literals", () => {
  it.each([
    ["a1b2c3", "#A1B2C3"],
    ["#a1b2c3", "#A1B2C3"],
    ["#12", "#12"],
    ["#", ""],
    ["", ""],
  ])("formats %s with a fixed color prefix", (value, expected) => {
    expect(maskValue(value, COLOR_MASK)).toBe(expected);
    expect(unmaskValue(expected, COLOR_MASK)).toBe(expected.slice(1));
  });

  it("keeps escaped tokens literal and preserves their case", () => {
    const mask = String.raw`\#\S\N\A\a\X\x#`;
    expect(maskValue("7", mask)).toBe("#SNAaXx7");
    expect(unmaskValue("#SNAaXx7", mask)).toBe("7");
    expect(maskValue("b", String.raw`\aA`)).toBe("aB");
  });

  it("supports literal backslashes, including a trailing backslash", () => {
    expect(maskValue("7", String.raw`\\#`)).toBe("\\7");
    expect(unmaskValue("\\7", String.raw`\\#`)).toBe("7");
    expect(maskValue("12", "##\\")).toBe("12\\");
    expect(maskValue("", "##\\")).toBe("");
    expect(maskValue("", "##\\", true)).toBe("__\\");
  });

  it("keeps literal-only masks empty unless filling is enabled", () => {
    expect(maskValue("", String.raw`\#`)).toBe("");
    expect(maskValue("#", String.raw`\#`)).toBe("");
    expect(maskValue("", String.raw`\#`, true)).toBe("#");
    expect(unmaskValue("#", String.raw`\#`)).toBe("");
    expect(deleteMaskedToken("#", String.raw`\#`, 1, "backward")).toBeNull();
  });

  it("fills editable positions without counting escape characters", () => {
    expect(maskValue("", COLOR_MASK, true)).toBe("#______");
    expect(maskValue("a1", COLOR_MASK, true)).toBe("#A1____");
    expect(maskValue("a1", COLOR_MASK, "*")).toBe("#A1****");
    expect(maskValue("#A1____", COLOR_MASK, true)).toBe("#A1____");
    expect(maskValue("#A1____2", COLOR_MASK, true)).toBe("#A12___");
    expect(unmaskValue("#A_2___", COLOR_MASK, true)).toBe("A2");
  });

  it("uses displayed positions for carets and escaped prefixes and suffixes", () => {
    expect(maskCaretPosition(0, COLOR_MASK, 7)).toBe(1);
    expect(maskCaretPosition(1, COLOR_MASK, 7)).toBe(2);
    expect(maskCaretPosition(3, COLOR_MASK, 7)).toBe(4);
    expect(maskCaretPosition(6, COLOR_MASK, 7)).toBe(7);

    const mask = String.raw`\###\#`;
    expect(maskValue("12", mask)).toBe("#12#");
    expect(unmaskValue("#12#", mask)).toBe("12");
    expect([0, 1, 2].map((count) => maskCaretPosition(count, mask, 4))).toEqual([1, 2, 4]);
  });

  it("deletes tokens around the fixed prefix and clears the last character", () => {
    expect(deleteMaskedToken("#ABCDEF", COLOR_MASK, 1, "backward")).toBeNull();
    expect(deleteMaskedToken("#ABCDEF", COLOR_MASK, 0, "forward")).toEqual({
      masked: "#BCDEF",
      unmasked: "BCDEF",
      caret: 1,
    });
    expect(deleteMaskedToken("#ABCDEF", COLOR_MASK, 7, "backward")).toEqual({
      masked: "#ABCDE",
      unmasked: "ABCDE",
      caret: 6,
    });
    expect(deleteMaskedToken("#A", COLOR_MASK, 2, "backward")).toEqual({
      masked: "",
      unmasked: "",
      caret: 1,
    });
  });

  it("preserves filled holes when deleting beside an escaped literal", () => {
    const mask = String.raw`##\###`;
    expect(maskValue("1234", mask, true)).toBe("12#34");
    expect(deleteMaskedToken("12#34", mask, 3, "backward", true)).toEqual({
      masked: "1_#34",
      unmasked: "134",
      caret: 1,
    });
    expect(deleteMaskedToken("12#34", mask, 2, "forward", true)).toEqual({
      masked: "12#_4",
      unmasked: "124",
      caret: 3,
    });
    expect(deleteMaskedToken("#A_____", COLOR_MASK, 2, "backward", true)).toEqual({
      masked: "#______",
      unmasked: "",
      caret: 1,
    });
  });

  it("preserves known unmasked data that matches a literal prefix", () => {
    const mask = String.raw`\AAA`;
    expect(maskValue("A", mask, undefined, true)).toBe("AA");
    expect(maskValue("A", mask, true, true)).toBe("AA_");
    expect(maskValue("AA", mask, true, true)).toBe("AAA");
    expect(maskValue("A", mask, "*", true)).toBe("AA*");
    expect(maskValue("", mask, undefined, true)).toBe("");
    expect(maskValue("", mask, true, true)).toBe("A__");
    expect(maskValue("a1b2c3", COLOR_MASK, undefined, true)).toBe("#A1B2C3");
  });

  it("does not consume a remaining token that matches an escaped prefix after deletion", () => {
    expect(deleteMaskedToken("ABA", String.raw`\AAA`, 2, "backward")).toEqual({
      masked: "AA",
      unmasked: "A",
      caret: 1,
    });
  });
});

describe("existing masks", () => {
  it.each([
    ["date", "20260927", "2026/09/27"],
    ["datetime", "202609271430", "2026/09/27 14:30"],
    ["time", "1430", "14:30"],
    ["fulltime", "143015", "14:30:15"],
    ["phone", "1234567890", "(123) 456 - 7890"],
    ["card", "1234567890123456", "1234 5678 9012 3456"],
    ["AA-####", "ab1234", "AB-1234"],
  ])("preserves %s formatting and unmasking", (mask, raw, expected) => {
    expect(maskValue(raw, mask)).toBe(expected);
    expect(maskValue(expected, mask)).toBe(expected);
    expect(unmaskValue(expected, mask)).toBe(raw.toUpperCase());
  });

  it("preserves phone deletion, caret offsets, and filling", () => {
    expect(maskCaretPosition(3, "phone", 16)).toBe(6);
    expect(deleteMaskedToken("(123) 456 - 7890", "phone", 6, "backward")).toEqual({
      masked: "(124) 567 - 890",
      unmasked: "124567890",
      caret: 3,
    });
    expect(maskValue("12", "phone", true)).toBe("(12_) ___ - ____");
  });
});
