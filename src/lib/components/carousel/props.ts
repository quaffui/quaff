import type { CarouselVariant } from "./carousel";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export interface QCarouselLabels {
  carousel: string;
  slide: string;
  previous: string;
  next: string;
  position: (index: number, count: number) => string;
}

export interface QCarouselProps<T> extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onselect"
> {
  /** Items in display order. */
  items: readonly T[];
  /** Item content. Avoid nesting controls when using onselect. */
  children: Snippet<[{ item: T; index: number }]>;
  /** Material 3 layout. @default multi-browse */
  variant?: CarouselVariant;
  /** Alignment of the prominent items. @default start */
  alignment?: "start" | "center";
  /** Zero-based prominent item index. Bindable. @default 0 */
  value?: number;
  /** Preferred maximum large item width in pixels; fixed width for uncontained items. @default 360 */
  itemWidth?: number;
  /** CSS height of the items. Full-screen defaults to 100svh; other layouts to 15rem. */
  height?: string;
  /** Width/height ratio for each uncontained-multi-aspect item, clamped to 9:16–16:9. */
  aspectRatio?: (item: T, index: number) => number;
  /** Accessible item name, followed by its position and total count. */
  itemLabel?: (item: T, index: number) => string;
  /** Makes each item a button. Called on pointer or keyboard activation. */
  onselect?: (item: T, index: number) => void;
  /** Snap to items. Defaults to false for uncontained layouts; always true for full-screen. */
  snap?: boolean;
  /** Shows navigation buttons below the items. Provide showAll or another accessible alternative if hidden. @default true */
  controls?: boolean;
  /** A link or button below the carousel that opens all items in a vertical view. */
  showAll?: Snippet;
  /** Translations for control labels, role descriptions, and item positions (zero-based index). */
  labels?: Partial<QCarouselLabels>;
}
