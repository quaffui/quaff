export type CarouselVariant =
  | "multi-browse"
  | "uncontained"
  | "uncontained-multi-aspect"
  | "hero"
  | "centered-hero"
  | "full-screen";

export interface CarouselFrame {
  /** Position relative to the viewport's logical start edge. */
  position: number;
  size: number;
  /** The unmasked content width stays constant while the item changes size. */
  contentSize: number;
}

interface CarouselLayoutOptions {
  variant: CarouselVariant;
  count: number;
  width: number;
  height: number;
  itemWidth?: number;
  gap?: number;
  small?: number;
  alignment?: "start" | "center";
  reducedMotion?: boolean;
  aspectRatios?: number[];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function createCarouselLayout({
  variant,
  count,
  width,
  height,
  itemWidth = 240,
  gap = 8,
  small = 48,
  alignment = "start",
  reducedMotion = false,
  aspectRatios = [],
}: CarouselLayoutOptions) {
  const extent = Math.max(0, variant === "full-screen" ? height : width);
  const maximum = Math.max(1, itemWidth);
  const isCentered = alignment === "center" || variant === "centered-hero";

  function createFixedLayout(sizes: number[], centerOffset?: number) {
    const total = sizes.reduce((sum, size) => sum + size, 0) + Math.max(0, count - 1) * gap;
    const length = Math.max(extent, total);
    let position = isCentered ? Math.max(0, (extent - total) / 2) : 0;
    const frames = sizes.map((size) => {
      const frame = { position, size, contentSize: size };
      position += size + gap;
      return frame;
    });
    const offsets = frames.map(({ position, size }, index) => {
      if (index === count - 1) {
        return length - extent;
      }

      const alignmentOffset = centerOffset ?? (isCentered ? (extent - size) / 2 : 0);
      return clamp(position - alignmentOffset, 0, length - extent);
    });

    function getFrames(offset: number) {
      return frames.map((frame) => ({ ...frame, position: frame.position - offset }));
    }

    return {
      length,
      itemWidth: sizes[0] ?? maximum,
      offsets,
      frames: getFrames,
    };
  }

  if (variant.startsWith("uncontained") || variant === "full-screen") {
    const sizes = Array.from({ length: count }, (_, index) => {
      if (variant === "full-screen") {
        return extent;
      }

      if (variant === "uncontained-multi-aspect" && !reducedMotion) {
        return height * clamp(aspectRatios[index] ?? 1, 9 / 16, 16 / 9);
      }

      return reducedMotion ? Math.min(maximum, extent) : maximum;
    });
    return createFixedLayout(sizes);
  }

  const isMultiBrowse = variant === "multi-browse";
  const isSymmetric = isCentered && (!isMultiBrowse || extent >= 568);
  const smallCount = isSymmetric ? 2 : 1;
  const mediumCount = isMultiBrowse ? smallCount : 0;
  const previewCount = mediumCount + smallCount;
  const preferredSmall = clamp(small, 40, 56);

  function createUniformLayout() {
    const slots = Math.min(count, Math.ceil((extent + gap) / (maximum + gap)));
    const size = Math.max(0, Math.min(maximum, (extent - (slots - 1) * gap) / slots));
    const centerOffset = isCentered ? Math.floor((slots - 1) / 2) * (size + gap) : 0;
    return createFixedLayout(Array(count).fill(size), centerOffset);
  }

  if (count <= previewCount) {
    const size = Math.max(0, Math.min(maximum, (extent - (count - 1) * gap) / Math.max(1, count)));
    return createFixedLayout(Array(count).fill(size));
  }

  // Very narrow containers cannot accommodate the minimum 40px previews.
  if (
    extent <= (previewCount + 1) * preferredSmall + previewCount * gap ||
    maximum <= preferredSmall
  ) {
    return createUniformLayout();
  }

  let largeCount = 1;

  function canFitMoreLargeItems() {
    const largeAndMediumWidth = (largeCount + mediumCount / 2) * maximum;
    const smallAndMediumWidth = (smallCount + mediumCount / 2) * 56;
    const gaps = (largeCount + previewCount - 1) * gap;
    const arrangementWidth = largeAndMediumWidth + smallAndMediumWidth + gaps;
    return largeCount + previewCount <= count && extent > arrangementWidth;
  }

  while (canFitMoreLargeItems()) {
    largeCount++;
  }

  if (largeCount + previewCount > count) {
    const size = Math.min(maximum, (extent - (count - 1) * gap) / count);
    return createFixedLayout(Array(count).fill(size));
  }

  const visibleCount = largeCount + previewCount;
  const gaps = (visibleCount - 1) * gap;
  const smallSize = clamp(
    (extent - (largeCount + mediumCount / 2) * maximum - gaps) / (smallCount + mediumCount / 2),
    preferredSmall,
    56
  );
  const available = extent - smallCount * smallSize - gaps;
  const largeSize = Math.min(
    maximum,
    (available - (mediumCount * smallSize) / 2) / (largeCount + mediumCount / 2)
  );

  if (largeSize <= smallSize) {
    return createUniformLayout();
  }

  if (reducedMotion) {
    return createFixedLayout(Array(count).fill(largeSize));
  }

  const mediumSize = mediumCount ? (available - largeCount * largeSize) / mediumCount : 0;
  const steps = count - largeCount;
  const stride = largeSize + gap;
  const centerBias = isCentered ? Math.floor((largeCount - 1) / 2) : 0;

  function getFramesForStep(step: number): CarouselFrame[] {
    const start = clamp(
      step - (isCentered ? Math.floor(previewCount / 2) : 0),
      0,
      count - visibleCount
    );
    const leading = step - start;
    const trailing = previewCount - leading;
    const leadingMedium = clamp(
      Math.ceil(mediumCount / 2),
      Math.max(0, mediumCount - trailing),
      Math.min(mediumCount, leading)
    );
    let position = -start * (smallSize + gap);

    return Array.from({ length: count }, (_, index) => {
      const isLarge = index >= step && index < step + largeCount;
      const isMedium =
        (index >= step - leadingMedium && index < step) ||
        (index >= step + largeCount && index < step + largeCount + mediumCount - leadingMedium);
      let size = smallSize;

      if (isLarge) {
        size = largeSize;
      } else if (isMedium) {
        size = mediumSize;
      }

      const frame = { position, size, contentSize: largeSize };
      position += size + gap;
      return frame;
    });
  }

  function getFrames(offset: number) {
    const progress = clamp(offset / stride, 0, steps);
    const step = Math.floor(progress);
    const fraction = progress - step;
    const current = getFramesForStep(step);

    if (!fraction) {
      return current;
    }

    const next = getFramesForStep(step + 1);
    return current.map((frame, index) => ({
      position: frame.position + (next[index].position - frame.position) * fraction,
      size: frame.size + (next[index].size - frame.size) * fraction,
      contentSize: largeSize,
    }));
  }

  return {
    length: extent + steps * stride,
    itemWidth: largeSize,
    offsets: Array.from(
      { length: count },
      (_, index) => clamp(index - centerBias, 0, steps) * stride
    ),
    frames: getFrames,
  };
}
