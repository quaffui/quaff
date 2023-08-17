import type { HTMLAttributes } from "svelte/elements";

export interface QCodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Language to use for highlighting.
   */
  language: string;

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
