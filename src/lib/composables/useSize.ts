import { isNumeric, type CssUnit, type QSize } from "$utils";

export const sizes: QSize[] = ["none", "xs", "sm", "md", "lg", "xl"];

export const CssUnits: CssUnit[] = ["px", "%", "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax"];

/**
 * Checks wether the input is a size like "sm" or "lg"
 */
export function isQuaffSize(size: number | string): size is QSize {
  return sizes.includes(size as QSize);
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
    get class() {
      return sizeClass;
    },
    get style() {
      return sizeStyle();
    },
  };
}
