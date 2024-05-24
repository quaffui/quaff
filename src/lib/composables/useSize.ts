import { isNumeric } from "$utils/number.js";

export const sizes: Q.Size[] = ["none", "xs", "sm", "md", "lg", "xl"];

export const CssUnits: Q.CssUnit[] = [
  "px",
  "%",
  "em",
  "ex",
  "ch",
  "rem",
  "vw",
  "vh",
  "vmin",
  "vmax",
];

/**
 * Checks wether the input is a size like "sm" or "lg"
 */
export function isQuaffSize(size: number | string): size is Q.Size {
  return sizes.includes(size as Q.Size);
}

export function useSize(size: number | string, component?: `q-${string}`) {
  const sizeClass = isQuaffSize(size) ? ` ${component}--${size}` : "";
  const sizeStyle = () => {
    if (isNumeric(size)) {
      return +size > 0 ? `${size}px` : undefined;
    }

    for (const unit of CssUnits) {
      if (size.slice(-unit.length) === unit) {
        return size;
      }
    }
  };

  return {
    class: sizeClass,
    style: sizeStyle(),
  };
}
