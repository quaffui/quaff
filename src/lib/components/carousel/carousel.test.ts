import { describe, expect, it } from "vitest";
import { createCarouselLayout, type CarouselVariant } from "./carousel";

const options = { count: 6, width: 600, height: 240, itemWidth: 360 };
const variants: CarouselVariant[] = [
  "multi-browse",
  "uncontained",
  "uncontained-multi-aspect",
  "hero",
  "centered-hero",
  "full-screen",
];

describe("carousel layout", () => {
  it("changes masks without resizing their media during scrolling", () => {
    const layout = createCarouselLayout({ ...options, variant: "multi-browse" });
    const initial = layout.frames(0);
    const scrolling = layout.frames(layout.offsets[1] / 2);

    expect(scrolling.some((frame, index) => frame.size !== initial[index].size)).toBe(true);
    expect(scrolling.map((frame) => frame.contentSize)).toEqual(
      initial.map((frame) => frame.contentSize)
    );
  });

  it("centers an interior featured item in centered hero layouts", () => {
    const layout = createCarouselLayout({
      ...options,
      variant: "centered-hero",
      itemWidth: 640,
    });
    const featured = layout.frames(layout.offsets[2])[2];

    expect(featured.position + featured.size / 2).toBeCloseTo(options.width / 2);
  });

  it("preserves permitted aspect ratios and clamps extreme ones", () => {
    const layout = createCarouselLayout({
      ...options,
      variant: "uncontained-multi-aspect",
      count: 4,
      aspectRatios: [0.1, 1, 1.5, 8],
    });
    const ratios = layout.frames(0).map((frame) => frame.size / options.height);

    expect(ratios[0]).toBeCloseTo(9 / 16);
    expect(ratios[1]).toBe(1);
    expect(ratios[2]).toBe(1.5);
    expect(ratios[3]).toBeCloseTo(16 / 9);
  });

  it("keeps unmasked item sizes constant when motion is reduced", () => {
    const layout = createCarouselLayout({
      ...options,
      variant: "multi-browse",
      reducedMotion: true,
    });
    const initial = layout.frames(0);
    const scrolling = layout.frames(layout.offsets[2] / 2);

    expect(scrolling.map((frame) => frame.size)).toEqual(initial.map((frame) => frame.size));
    expect(scrolling.every((frame) => frame.size === frame.contentSize)).toBe(true);
  });

  it("fully exposes the last full-screen item at its final snap", () => {
    const layout = createCarouselLayout({
      ...options,
      variant: "full-screen",
      height: 800,
      gap: 16,
    });
    const last = layout.frames(layout.offsets.at(-1)!).at(-1)!;

    expect(last.position).toBe(0);
    expect(last.size).toBe(800);
    expect(last.contentSize).toBe(800);
  });

  it.each(variants)("keeps %s geometry valid for empty, narrow and wide containers", (variant) => {
    for (const { count, width } of [
      { count: 0, width: 0 },
      { count: 6, width: 40 },
      { count: 6, width: 1600 },
    ]) {
      const layout = createCarouselLayout({ ...options, variant, count, width });
      const extent = variant === "full-screen" ? options.height : width;
      const maximumOffset = layout.length - extent;

      expect(Number.isFinite(maximumOffset)).toBe(true);
      expect(maximumOffset).toBeGreaterThanOrEqual(0);
      expect(layout.offsets).toHaveLength(count);
      expect(layout.offsets).toEqual([...layout.offsets].sort((a, b) => a - b));

      for (const offset of layout.offsets) {
        expect(offset).toBeGreaterThanOrEqual(0);
        expect(offset).toBeLessThanOrEqual(maximumOffset);
      }

      for (const offset of [0, maximumOffset / 2, maximumOffset]) {
        const frames = layout.frames(offset);

        expect(frames).toHaveLength(count);

        for (const frame of frames) {
          expect(Object.values(frame).every(Number.isFinite)).toBe(true);
          expect(frame.size).toBeGreaterThanOrEqual(0);
          expect(frame.contentSize).toBeGreaterThanOrEqual(frame.size);
        }
      }
    }
  });
});
