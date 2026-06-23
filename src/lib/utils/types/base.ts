export type CssUnit = "px" | "%" | "em" | "ex" | "ch" | "rem" | "vw" | "vh" | "vmin" | "vmax";

export type CssValue = `${number}${CssUnit}`;

export type StringWithSuggestions<T extends string> = T | (string & {});
