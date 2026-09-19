import type { Snippet } from "svelte";
import type { HTMLLinkAttributes, HTMLMetaAttributes } from "svelte/elements";

export type MetaTag = HTMLMetaAttributes & {
  /** Formats the final content of this tag. */
  template?: (content: string) => string;
};

export interface MetaOptions {
  title?: string;
  titleTemplate?: (title: string) => string;
  /** Keys identify tags across components. Use null to remove an inherited tag. */
  meta?: Record<string, MetaTag | null>;
  link?: Record<string, HTMLLinkAttributes | null>;
}

export type MetaSource = MetaOptions | (() => MetaOptions);

export interface QMetaProps {
  /** App defaults, overridden by descendant useMeta calls. */
  metadata?: MetaSource;
  children?: Snippet;
}
