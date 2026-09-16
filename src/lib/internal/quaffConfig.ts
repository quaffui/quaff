import type { QuaffI18nConfig } from "./i18n.svelte";

export interface QuaffConfig extends QuaffI18nConfig {
  /**
   * Use Material 3 Expressive styling globally.
   * This can be overridden by individual components.
   */
  expressive: boolean;
}

export const quaffConfig: QuaffConfig = { expressive: false };
