import type { CssUnit, QuaffSizes } from "$lib/utils";
import { isNumeric } from "$lib/utils/number";

export const sizes: QuaffSizes[] = ["none", "xs", "sm", "md", "lg", "xl"];
export const CssUnits: CssUnit[] = ["px", "%", "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax"];

interface UseSize {
  class?: string;
  style?: string;
}

export function useSize(sizeProp?: string | number): UseSize {
  if (sizeProp !== undefined && isNumeric(sizeProp) && Number(sizeProp) > 0) {
    return {
      style: `${sizeProp}px`,
    };
  }

  if (typeof sizeProp === "string") {
    for (const unit of CssUnits) {
      if (sizeProp.slice(-unit.length) === unit) {
        return {
          style: sizeProp,
        };
      }

      if (sizes.includes(sizeProp as QuaffSizes)) {
        return {
          class: sizeProp,
        };
      }
    }
  }

  return {};
}
