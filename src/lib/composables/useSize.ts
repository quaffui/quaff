import { CssUnit, QuaffSizes, isNumber } from "$lib/utils";

export const sizes: QuaffSizes[] = ["none", "xs", "sm", "md", "lg", "xl"];
export const CssUnits: CssUnit[] = ["px", "%", "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax"];

interface UseSize {
  class?: string;
  style?: string;
}

export function useSize(sizeProp: unknown): UseSize {
  if (isNumber(sizeProp) && sizeProp > 0) {
    return {
      style: `${sizeProp}px`,
    };
  } else if (typeof sizeProp === "string") {
    for (const unit of CssUnits) {
      if (sizeProp.slice(-unit.length) === unit) {
        return {
          style: sizeProp,
        };
      } else if (sizes.includes(sizeProp as QuaffSizes)) {
        return {
          class: sizeProp,
        };
      }
    }
  }

  return {};
}
