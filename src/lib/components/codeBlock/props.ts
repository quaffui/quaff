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
  theme?: "quaff" | BundledTheme | { light: BundledTheme; dark: BundledTheme };

  /**
   * Code to highlight.
   */
  code?: string;

  /**
   * Title to display above the code.
   */
  title?: string;

  /**
   * Wether the code should be copiable or not.
   * @default false
   */
  copiable?: boolean;
}
