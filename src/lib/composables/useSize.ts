import { isNumber } from "$utils/number.js";

export const sizes: __Quaff__.Size[] = ["none", "xs", "sm", "md", "lg", "xl"];

export const CssUnits: __Quaff__.CssUnit[] = [
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
export function isQuaffSize(size: number | string): size is __Quaff__.Size {
  return sizes.includes(size as __Quaff__.Size);
}

export function useSize(size: number | string, component?: `q-${string}`) {
  const sizeClass = isQuaffSize(size) ? ` ${component}--${size}` : "";
  const sizeStyle = () => {
    if (isNumber(size)) {
      return size > 0 ? `${size}px` : undefined;
    } else {
      for (const unit of CssUnits) {
        if (size.slice(-unit.length) === unit) {
          return size;
        }
      }
    }
  };

  return {
    class: sizeClass,
    style: sizeStyle(),
  };
}
