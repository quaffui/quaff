export type CssUnit = "px" | "%" | "em" | "ex" | "ch" | "rem" | "vw" | "vh" | "vmin" | "vmax";

export type CssValue = `${number}${CssUnit}`;

export type StringWithSuggestions<T extends string> = T | (string & {});

/**
 * Utility type used to indicate the default value for a prop.
 * This is used for decgen to know what the default value is for extended properties.
 */
export type WithDefault<T, _D extends T> = T;
