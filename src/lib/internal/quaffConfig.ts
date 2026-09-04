export interface QuaffConfig {
  /**
   * Use Material 3 Expressive styling globally.
   * This can be overridden by individual components.
   */
  expressive: boolean;
}

export const quaffConfig: QuaffConfig = { expressive: false };
