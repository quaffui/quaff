import { getContext, setContext } from "svelte";
import type { QuaffI18nConfig } from "./i18n.svelte";

export interface QuaffConfig extends QuaffI18nConfig {
  /**
   * Use Material 3 Expressive styling globally.
   * This can be overridden by individual components.
   */
  expressive: boolean;
  /** Global layout direction. Omit to keep the page's existing HTML direction. */
  rtl?: boolean;
}

const CONFIG_CONTEXT = Symbol("quaff-config");

export function initQuaffConfig(config: Partial<QuaffConfig>) {
  setContext(CONFIG_CONTEXT, config);

  // Apply direction before popup effects read their trigger's geometry.
  $effect.pre(() => {
    const rtl = config.rtl;

    if (rtl === undefined) {
      return;
    }

    const element = document.documentElement;
    const previousDirection = element.getAttribute("dir");
    const direction = rtl ? "rtl" : "ltr";
    element.dir = direction;

    return () => {
      if (element.getAttribute("dir") !== direction) {
        return;
      }

      if (previousDirection === null) {
        element.removeAttribute("dir");
      } else {
        element.setAttribute("dir", previousDirection);
      }
    };
  });
}

export function useQuaffConfig() {
  const config = getContext<Partial<QuaffConfig> | undefined>(CONFIG_CONTEXT);

  return {
    get rtl() {
      return config?.rtl;
    },
    get expressive() {
      return config?.expressive ?? false;
    },
  };
}
