import type { HTMLAttributes } from "svelte/elements";
import type { SpecialLanguage, BundledLanguage, BundledTheme } from "shiki";

export interface QCodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Language to use for highlighting.
   */
  language: BundledLanguage | SpecialLanguage;

  /**
   * Theme to use for highlighting for light mode.
   */
  lightTheme?: BundledTheme;

  /**
   * Theme to use for highlighting for dark mode.
   */
  darkTheme?: BundledTheme;

  /**
   * Code to highlight.
   */
  code?: string;

  /**
   * Title to display above the code.
   * @default undefined
   */
  title?: string;

  /**
   * Wether the code should be copiable or not.
   * @default false
   */
  copiable?: boolean;
}
