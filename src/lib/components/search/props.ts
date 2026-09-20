import type { Snippet } from "svelte";
import type { HTMLInputAttributes } from "svelte/elements";

export interface QSearchLabels {
  back: string;
  clear: string;
  results: string;
  searching: string;
}

export interface QSearchProps extends Omit<
  HTMLInputAttributes,
  "value" | "type" | "children" | "onsearch"
> {
  /** The search query. Supports two-way binding. */
  value?: string;

  /** Placeholder for an empty query. Defaults to the language pack's search placeholder. */
  placeholder?: HTMLInputAttributes["placeholder"];

  /** Whether the search view is open. Supports two-way binding. Native validation also opens an invalid field. */
  open?: boolean;

  /** Uses full-screen search below 600px and a docked view otherwise. */
  layout?: "auto" | "docked" | "fullscreen";

  /** Uses the contained search style. Otherwise uses the divided style. Inherits the Quaff.init() expressive setting when omitted. */
  expressive?: boolean;

  /** Marks the results as busy and displays a progress indicator. */
  loading?: boolean;

  /** Announces result counts or empty states to assistive technology. Update this when results change. */
  status?: string;

  /** Overrides the language pack's accessible labels for the back and clear actions, results region, and loading announcement. */
  labels?: Partial<QSearchLabels>;

  /** Runs when Enter is pressed or the snippet's search function is called. The view stays open and focus moves to the results. */
  onsearch?: (query: string) => void;

  /** Replaces the collapsed bar's search icon, for example with a navigation action. */
  leading?: Snippet;

  /** Collapsed bar actions. Use at most two icon buttons, or an avatar and one icon button. */
  trailing?: Snippet;

  /** Suggestions, results, filters, and empty states. Use QList for keyboard navigation between results. */
  children?: Snippet<[{ value: string; close: () => void; search: (query?: string) => void }]>;
}

export type QSearchScope = Parameters<NonNullable<QSearchProps["children"]>>[0];
