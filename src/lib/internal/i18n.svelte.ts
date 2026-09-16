import { getContext, setContext } from "svelte";
import en from "../locales/en-US.js";
import type { QuaffLanguage, QuaffTranslations } from "../locales/types.js";

export interface QuaffI18nConfig {
  /** Built-in or custom language pack. Defaults to English. */
  language?: QuaffLanguage;
  /** Overrides the language pack’s locale for date/time formatting and table sorting. */
  locale?: string;
  /** Stock component text overrides. Omitted entries use the selected language pack. */
  translations?: {
    [Component in keyof QuaffTranslations]?: Partial<QuaffTranslations[Component]>;
  };
}

const i18nContext = Symbol("quaff-i18n");

export function initI18n(config: QuaffI18nConfig) {
  setContext(i18nContext, config);
}

export function useI18n<Component extends keyof QuaffTranslations>(component: Component) {
  const config = getContext<QuaffI18nConfig | undefined>(i18nContext);
  const labels = $derived.by(() => {
    const defaults = config?.language?.translations[component] ?? en.translations[component];
    const merged = { ...defaults, ...config?.translations?.[component] };

    for (const key in merged) {
      merged[key] ??= defaults[key];
    }

    return merged;
  });

  return {
    get locale() {
      return config?.locale ?? config?.language?.locale ?? en.locale;
    },
    get labels() {
      return labels;
    },
  };
}
